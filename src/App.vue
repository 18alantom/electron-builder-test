<template>
  <div class="container">
    <p>{{ counter }}</p>
    <button @click="incr">incr</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      counter: 0,
    };
  },
  methods: {
    async incr() {
      const a = this.counter;
      /**
       * window.api.incr is set by the preload.js script
       */

      // @ts-ignore
      this.counter = await window?.api?.incr(this.counter);
    },
  },
});
</script>
<style>
body {
  width: 100vw;
  height: 100vh;
  background-color: rgb(47, 48, 79);
  color: rgb(234, 235, 238);
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.container > button {
  padding: 0.5rem 1rem;
  letter-spacing: 4px;
  border-radius: 0.25rem;
  border: 0;
  color: rgb(70, 71, 104);
  background-color: rgb(234, 235, 238);
}

.container > p {
  font-size: 2rem;
  font-family: sans-serif;
  padding: 1rem;
  padding-left: 0;
  border-right: 1px solid rgb(70, 71, 104);
}
</style>
