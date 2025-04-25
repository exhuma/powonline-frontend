// src/vue.d.ts
import Vue from 'vue'
import { Proxy } from './remote/index' // replace with actual path to the type of remoteProxy

declare module 'vue/types/vue' {
  interface Vue {
    $remoteProxy: Proxy
  }
}
