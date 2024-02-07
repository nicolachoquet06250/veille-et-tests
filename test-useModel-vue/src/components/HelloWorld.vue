<script setup lang="ts">
import { ref } from 'vue'
import Test from './Test.vue';

defineProps<{ msg: string }>()

const count = ref(0);

const modelValue = ref({
  hello: 'World',
  world: {
    name: 'World'
  }
});
const test = ref('');

setTimeout(() => {
  modelValue.value.hello = 'Nico';
  modelValue.value.world.name = 'Nico w';
  test.value = 'Nico';
}, 2000);
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  
  <div style="text-align: left;">
      Test: Hello {{ modelValue.hello }} ({{ modelValue.world.name }}) => {{ test }}
  </div>

  <Test v-model="modelValue" v-model:test="test" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
