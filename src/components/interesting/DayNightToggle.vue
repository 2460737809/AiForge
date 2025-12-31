<template>
  <div
    class="toggle-wrapper"
    :class="{ 'is-dark': modelValue }"
    @click="toggle"
  >
    <div class="toggle-input">
      <div class="bg-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>

      <div class="stars">
        <div v-for="n in 6" :key="n" :class="['star', `star-${n}`]"></div>
      </div>

      <div class="handle">
        <div class="craters">
          <span class="crater"></span>
          <span class="crater"></span>
          <span class="crater"></span>
        </div>
      </div>

      <div class="clouds">
        <div v-for="n in 5" :key="n" :class="['cloud', `cloud-${n}`]"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue"]);

const toggle = () => emit("update:modelValue", !props.modelValue);
</script>

<style lang="scss" scoped>
// 颜色变量
$day-sky: #92b6d5;
$night-sky: #1d263a;
$sun-color: #ffce54;
$moon-color: #f5f5f5;
$transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);

.toggle-wrapper {
  width: 70px;
  height: 30px;
  background-color: $day-sky;
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  padding: 3px;
  transition: background-color $transition;
  overflow: hidden;
  // 核心：拟物化内阴影
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -2px 2px rgba(255, 255, 255, 0.2);

  .toggle-input {
    position: relative;
    width: 100%;
    height: 100%;
  }
}

// 1. 滑块本体 (太阳/月亮)
.handle {
  position: absolute;
  z-index: 10;
  width: 24px;
  height: 24px;
  background-color: $sun-color;
  border-radius: 50%;
  transition: $transition;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  .craters {
    opacity: 0;
    transition: $transition;
    .crater {
      position: absolute;
      background: #d5d5d5;
      border-radius: 50%;
      box-shadow: inset 0 1px 0.5px rgba(0, 0, 0, 0.2);
      &:nth-child(1) {
        width: 6px;
        height: 6px;
        top: 6px;
        left: 12px;
      }
      &:nth-child(2) {
        width: 4px;
        height: 4px;
        top: 14px;
        left: 6px;
      }
      &:nth-child(3) {
        width: 3px;
        height: 3px;
        top: 5px;
        left: 5px;
      }
    }
  }
}

// 2. 背景装饰圆圈 (视差效果)
.bg-decoration {
  .circle {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: $transition;
  }
  .circle-1 {
    width: 50px;
    height: 50px;
    top: -10px;
    left: -5px;
  }
  .circle-2 {
    width: 70px;
    height: 70px;
    top: -20px;
    left: 10px;
  }
  .circle-3 {
    width: 90px;
    height: 90px;
    top: -30px;
    left: 25px;
  }
}

// 3. 星星
.stars {
  position: absolute;
  top: -20px; // 初始在上方隐藏
  transition: $transition;
  .star {
    position: absolute;
    background: #fff;
    border-radius: 50%;
  }
  .star-1 {
    width: 1px;
    height: 1px;
    top: 2px;
    left: 5px;
    transition-delay: 0.05s;
  }
  .star-2 {
    width: 2px;
    height: 2px;
    top: 6px;
    left: 18px;
    transition-delay: 0.1s;
  }
  .star-3 {
    width: 1px;
    height: 1px;
    top: 4px;
    left: 30px;
    transition-delay: 0.15s;
  }
  .star-4 {
    width: 2px;
    height: 2px;
    top: 10px;
    left: 12px;
    transition-delay: 0.2s;
  }
  .star-5 {
    width: 1px;
    height: 1px;
    top: 8px;
    left: 25px;
    transition-delay: 0.25s;
  }
  .star-6 {
    width: 2px;
    height: 2px;
    top: 12px;
    left: 35px;
    transition-delay: 0.3s;
  }
}

// 4. 云朵
.clouds {
  position: absolute;
  bottom: -2px;
  width: 100%;
  transition: $transition;
  .cloud {
    position: absolute;
    background: #fff;
    border-radius: 50%;
    transition: $transition;
    &:nth-child(1) {
      width: 25px;
      height: 25px;
      bottom: -10px;
      right: 5px;
    }
    &:nth-child(2) {
      width: 20px;
      height: 20px;
      bottom: -8px;
      right: 20px;
    }
    &:nth-child(3) {
      width: 18px;
      height: 18px;
      bottom: -5px;
      right: 35px;
    }
    &:nth-child(4) {
      width: 15px;
      height: 15px;
      bottom: -10px;
      right: 0px;
      opacity: 0.8;
    }
    &:nth-child(5) {
      width: 22px;
      height: 22px;
      bottom: -12px;
      right: 15px;
    }
  }
}

// --- 状态切换 ---

.is-dark {
  background-color: $night-sky;

  .handle {
    transform: translateX(40px);
    background-color: $moon-color;
    .craters {
      opacity: 1;
    }
  }

  .bg-decoration .circle {
    transform: translateX(-10px);
    background: rgba(255, 255, 255, 0.05);
  }

  .stars {
    transform: translateY(25px);
  }

  .clouds {
    transform: translateY(30px); // 云朵沉下去
  }
}
</style>
