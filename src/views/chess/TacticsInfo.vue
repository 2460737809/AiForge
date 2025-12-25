<template>
  <div class="tactics-info-modal" v-if="show">
    <div class="tactics-info-content">
      <div class="tactics-header">
        <h2>中国象棋战术知识</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="tactics-content">
        <div class="tactics-section">
          <h3>一、基础战术与手段</h3>
          <p>这类名词通常指在对局中获取子力优势或创造进攻机会的方法。</p>
          
          <div class="tactic-item">
            <h4>将军抽车</h4>
            <p>利用棋子将军，迫使对方移动将/帅或应将，同时顺势吃掉对方不受保护的"车"。这是最典型的双重打击。</p>
          </div>
          
          <div class="tactic-item">
            <h4>闪击 (抽杀)</h4>
            <p>移开自己的一个棋子后，使后方棋子露出并照将，同时移开的那个子去吃对方的高分值子力。</p>
          </div>
          
          <div class="tactic-item">
            <h4>牵制 (钉子)</h4>
            <p>利用远射程棋子（车、马、炮）攻击对方，使对方被攻击线路上的棋子不敢移动，否则会丢子或丢将。</p>
          </div>
          
          <div class="tactic-item">
            <h4>双重照将</h4>
            <p>走动一子后，自己的两个棋子同时对敌方将/帅发出攻击。对方必须移动王来躲避，不能通过垫子或吃子化解。</p>
          </div>
          
          <div class="tactic-item">
            <h4>顿挫</h4>
            <p>通过一个中间步骤（如先将军或先叫吃），迫使对方棋子走到不利位置，从而达到己方的最终目的。</p>
          </div>
        </div>
        
        <div class="tactics-section">
          <h3>二、经典杀招 (杀法)</h3>
          <p>这类名词通常指最后致胜的定式。</p>
          
          <h4>1. 马系列</h4>
          <div class="tactic-item">
            <h5>挂角马</h5>
            <p>马在对方九宫格的任何一个角上（士角位置）将军。这能限制将/帅的移动，常配合车、炮完成杀局。</p>
          </div>
          
          <div class="tactic-item">
            <h5>卧槽马</h5>
            <p>马位于对方底线前一行的河界边缘（即棋盘第3或第7路，倒数第二行），直接将军或控制将位。</p>
          </div>
          
          <div class="tactic-item">
            <h5>钓鱼马</h5>
            <p>马在对方"三三"位置（即从底线数第3行，从中线数第3路），配合其他子力将死对方。</p>
          </div>
          
          <div class="tactic-item">
            <h5>八角马</h5>
            <p>马位于对方九宫的中心，控制四个逃跑点，配合车或兵在侧翼完成致命一击。</p>
          </div>
          
          <h4>2. 炮系列</h4>
          <div class="tactic-item">
            <h5>重炮杀</h5>
            <p>两个炮在同一条直线上（通常是中线或底线）重叠，前炮将军，后炮作为炮架。</p>
          </div>
          
          <div class="tactic-item">
            <h5>闷杀 (闷宫)</h5>
            <p>利用对方将/帅被自己的棋子（通常是士、象）堵塞住退路的弱点，用炮（或马）一举将死。</p>
          </div>
          
          <div class="tactic-item">
            <h5>天地炮</h5>
            <p>一炮居中路（中炮），一炮在底线（沉底炮），使对方将/帅上下受困。</p>
          </div>
          
          <h4>3. 车与组合系列</h4>
          <div class="tactic-item">
            <h5>双车错</h5>
            <p>两部车在相邻的两条线路（通常是底线和倒数第二线）交替将军，像拉锯一样锁死对方将位。</p>
          </div>
          
          <div class="tactic-item">
            <h5>大刀剜心</h5>
            <p>车在炮或兵的掩护下，强行吃掉对方正中间的士（或象）直插入腹心将军取胜。</p>
          </div>
          
          <div class="tactic-item">
            <h5>铁门栓</h5>
            <p>中炮镇住中路，用车或兵在底线或肋线锁住对方将门的杀法。</p>
          </div>
          
          <div class="tactic-item">
            <h5>海底捞月</h5>
            <p>在残局中，车利用对方将/帅底线的掩护，通过炮作为炮架，在底线横向将军致胜。</p>
          </div>
        </div>
        
        <div class="tactics-section">
          <h3>三、其它趣味名词</h3>
          
          <div class="tactic-item">
            <h4>老牛推车</h4>
            <p>指用兵（卒）在车的掩护下，一步步逼近对方将门。</p>
          </div>
          
          <div class="tactic-item">
            <h4>二鬼拍门</h4>
            <p>两个兵（卒）占据对方九宫的两个士角位置，威胁极大。</p>
          </div>
          
          <div class="tactic-item">
            <h4>白脸将</h4>
            <p>利用"将帅不能对面"的规则，一方将/帅在中路上露面，配合其他棋子将死对方。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.tactics-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.tactics-info-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.tactics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #409eff;
  background: linear-gradient(to right, #409eff, #66b1ff);
  color: white;
  border-radius: 12px 12px 0 0;
}

.tactics-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tactics-content {
  padding: 20px;
}

.tactics-section {
  margin-bottom: 30px;
}

.tactics-section h3 {
  color: #2c3e50;
  border-bottom: 2px solid #34495e;
  padding-bottom: 8px;
  margin-top: 0;
}

.tactics-section h4 {
  color: #34495e;
  margin-top: 20px;
}

.tactics-section h5 {
  color: #555;
  margin-top: 15px;
}

.tactic-item {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.tactic-item h4, .tactic-item h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.tactic-item p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tactics-info-content {
    width: 95%;
    margin: 20px;
  }
  
  .tactics-header h2 {
    font-size: 1.2rem;
  }
  
  .tactics-content {
    padding: 15px;
  }
}
</style>