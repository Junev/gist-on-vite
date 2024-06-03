import type { Ref } from "vue";
import { ref, watchEffect, onMounted, onUnmounted } from "vue";

function useResizeHeight(containerRef: Ref) {
  const height = ref(0);

  watchEffect(() => {
    if (containerRef.value) {
      height.value = containerRef.value.getBoundingClientRect().height
    }
  })
  
  function update() {
    height.value = containerRef.value.getBoundingClientRect().height;
    console.log(containerRef.value.getBoundingClientRect().height)
  }

  onMounted(() => {
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { height }
}

export default useResizeHeight;