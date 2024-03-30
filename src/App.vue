<script setup lang="ts">
import { computed, provide } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { DateNowKey } from './InjectionKeys'
import type { DateNow } from './types/Clock.ts'

provide<DateNow>(DateNowKey, () => new Date())

const route = useRoute()
const headerMsg = computed(() => {
  const path = route.path
  if (path.includes('/trip')) {
    return 'Trip details'
  } else {
    return 'Select a trip'
  }
})
</script>

<template>
  <header>
    <a href="https://www.ember.to/">
      <img alt="Ember logo" class="logo" src="@/assets/ember-logo.svg" width="125" height="50" />
    </a>
    <div class="wrapper">
      <TheHeader :msg="headerMsg" />
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  padding: 0.5rem;
}

header {
  display: flex;
  place-items: top;
}

.logo {
  display: block;
  margin: 0 2rem 0 0;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
}

nav {
  text-align: left;
  margin-left: -1rem;
  font-size: 1rem;

  padding: 1rem 0;
  margin-top: 1rem;
}
</style>
