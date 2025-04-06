<template>
  <div class="split-view">
    <div class="left-pane" :style="{ width: leftPaneWidth + 'px' }">
      <slot name="left"></slot>
    </div>
    <div class="divider" @mousedown="startDragging"></div>
    <div class="right-pane" :style="{ width: rightPaneWidth + 'px' }">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'split-view',
  data() {
    return {
      leftPaneWidth: 300, // Initial width of the left pane
      rightPaneWidth: 300, // Initial width of the right pane
      isDragging: false,
      startX: 0
    }
  },
  methods: {
    startDragging(event) {
      this.isDragging = true
      this.startX = event.clientX
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDragging)
    },
    onDrag(event) {
      if (!this.isDragging) return

      const deltaX = event.clientX - this.startX
      this.startX = event.clientX

      this.leftPaneWidth += deltaX
      this.rightPaneWidth -= deltaX

      // Prevent panes from collapsing
      if (this.leftPaneWidth < 100) this.leftPaneWidth = 100
      if (this.rightPaneWidth < 100) this.rightPaneWidth = 100
    },
    stopDragging() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDragging)
    }
  }
}
</script>

<style scoped>
.split-view {
  display: flex;
  width: 100%;
  height: 100%;
}

.left-pane,
.right-pane {
  height: 100%;
  overflow: auto;
}

.divider {
  width: 5px;
  cursor: col-resize;
  background-color: #ccc;
}
</style>
