<template>
  <div class="text-xs-center">
    <gallery :images="images" :index="index" @close="index = null"></gallery>
    <div
      class="image"
      v-for="(image, imageIndex) in images"
      :key="imageIndex"
      @click="index = imageIndex"
      :style="{ backgroundImage: 'url(' + image.thumbnail + ')', width: '300px', height: '200px' }"
      ></div>
  </div>
</template>

<style scoped>
  .image {
    float: left;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    margin: 5px;
  }
</style>

<script>
import VueGallery from 'vue-gallery'
export default {

  created () {
    this.$store.dispatch('refreshGallery')
  },
  components: {
    'gallery': VueGallery
  },
  data () {
    return {
      index: null
    }
  },
  computed: {
    images () {
      return this.$store.state.gallery
    }
  }
}
</script>
