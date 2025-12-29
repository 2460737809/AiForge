// 为HTMLElement扩展自定义属性
declare global {
  interface HTMLElement {
    clickOutsideEvent?: (event: Event) => void;
  }
}

// 自定义指令：点击外部区域
const vClickOutside = {
  beforeMount(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: HTMLElement) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent);
    }
  }
};

export default vClickOutside;