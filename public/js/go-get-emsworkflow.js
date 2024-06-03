function CreateDiagram(PaletteDiv, DiagramDiv, ChangedSelection) {
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    myDiagram = $(go.Diagram, DiagramDiv,  // must name or refer to the DIV HTML element
        {
            initialContentAlignment: go.Spot.Center,
            allowDrop: true,  // must be true to accept drops from the Palette
            "LinkDrawn": showLinkLabel,  // this DiagramEvent listener is defined below
            "LinkRelinked": showLinkLabel,
            scrollsPageOnFocus: false,
            "undoManager.isEnabled": true,  // enable undo & redo,
            "ChangedSelection":
                function (e) {
                    if (e.diagram.selection.size === 1) {
                        let part = e.diagram.selection.first();
                        if (part.category == "Step") {
                            ChangedSelection(part.data);
                        }
                        else
                            ChangedSelection(null);
                    }
                    else
                        ChangedSelection(null);
                }
        });

    function nodeStyle() {
        return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), { locationSpot: go.Spot.Center }];
    }

    function makePort(name, align, spot, output, input) {
        var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
        return $(go.Shape,
          {
              fill: "transparent",  // changed to a color in the mouseEnter event handler
              strokeWidth: 0,  // no stroke
              width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
              height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
              alignment: align,  // align the port on the main Shape
              stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
              portId: name,  // declare this object to be a "port"
              fromSpot: spot,  // declare where links may connect at this port
              fromLinkable: output,  // declare whether the user may draw links from here
              toSpot: spot,  // declare where links may connect at this port
              toLinkable: input,  // declare whether the user may draw links to here
              cursor: "pointer",  // show a different cursor to indicate potential link point
              mouseEnter: function (e, port) {  // the PORT argument will be this Shape
                  if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
              },
              mouseLeave: function (e, port) {
                  port.fill = "transparent";
              }
          });
    }
    function textStyle() {
        return {
            font: "bold 11pt Helvetica, Arial, sans-serif",
            stroke: "whitesmoke"
        }
    }

    myDiagram.nodeTemplateMap.add("",  // the default category
      $(go.Node, "Table", nodeStyle(),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "#00A9C9", strokeWidth: 0 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
                margin: 8,
                maxSize: new go.Size(500, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
        makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Conditional",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Auto",
          $(go.Shape, "Diamond",
            { fill: "#00A9C9", strokeWidth: 0 },
            new go.Binding("figure", "figure")),
          $(go.TextBlock, textStyle(),
            {
                margin: 8,
                maxSize: new go.Size(500, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true
            },
            new go.Binding("text").makeTwoWay())
        ),
        makePort("T", go.Spot.Top, go.Spot.Top, false, true),
        makePort("L", go.Spot.Left, go.Spot.LeftSide, false, false),
        makePort("R", go.Spot.Right, go.Spot.RightSide, false, false),
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    myDiagram.nodeTemplateMap.add("Start",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Auto",
          $(go.Shape, "Circle",
            { minSize: new go.Size(40, 40), fill: "#79C900", strokeWidth: 0 }),
          $(go.TextBlock, "Start", textStyle(),
            new go.Binding("text"))
        ),
        // three named ports, one on each side except the top, all output only:
        makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
      ));

    myDiagram.nodeTemplateMap.add("End",
      $(go.Node, "Table", nodeStyle(),
        $(go.Panel, "Auto",
          $(go.Shape, "Circle",
            { minSize: new go.Size(40, 40), fill: "#DC3C00", strokeWidth: 0 }),
          $(go.TextBlock, "End", textStyle(),
            new go.Binding("text"))
        ),
        // three named ports, one on each side except the bottom, all input only:
        makePort("T", go.Spot.Top, go.Spot.Top, false, true)
      ));

    myDiagram.nodeTemplateMap.add("Comment",
      $(go.Node, "Auto", nodeStyle(),
        $(go.Shape, "File",
          { fill: "#EFFAB4", strokeWidth: 0 }),
        $(go.TextBlock, textStyle(),
          {
              margin: 5,
              maxSize: new go.Size(800, NaN),
              wrap: go.TextBlock.WrapFit,
              textAlign: "center",
              editable: true,
              font: "bold 12pt Helvetica, Arial, sans-serif",
              stroke: '#454545'
          },
          new go.Binding("text").makeTwoWay())
      ));
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 5, toShortLength: 4,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            resegmentable: true,
            mouseEnter: function (e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
            mouseLeave: function (e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,  // the highlight shape, normally transparent
          { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        $(go.Shape,  // the link path shape
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
        $(go.Panel, "Auto",  // the link label, normally not visible
          { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(go.Shape, "RoundedRectangle",  // the label shape
            { fill: "#F8F8F8", strokeWidth: 0 }),
          $(go.TextBlock, "Yes",  // the label
            {
                textAlign: "center",
                font: "10pt helvetica, arial, sans-serif",
                stroke: "#333333",
                editable: true
            },
            new go.Binding("text").makeTwoWay())
        )
      );
    function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL");
        if (label !== null) label.visible = (e.subject.fromNode.data.figure === "Diamond");
    }

    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
    
    myPalette =
      $(go.Palette, PaletteDiv,  // must name or refer to the DIV HTML element
        {
            scrollsPageOnFocus: false,
            nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
            model: new go.GraphLinksModel([  // specify the contents of the Palette
              { category: "Start", text: "开始" },
              { category: "Step", text: "工作流步骤" },
              { category: "Comment", text: "描述文本" },
              { category: "End", text: "结束" }
            ])
        });
} // end init

function LoadDiagram(DiagramModel) {
    myDiagram.model = go.Model.fromJson(DiagramModel);
}
function getDiagramChartData() {
    return myDiagram.model.toJson();
}
