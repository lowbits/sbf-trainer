<script setup lang="ts">
import NewUserModal from "~/components/modals/NewUserModal.vue";

const userToken = useCookie('sbf_user_token')

const handleDailyChallenge = () => {
  userToken.value = generateUserToken()
  navigateTo('/daily')
}

const handleQuickQuiz = () => {
  userToken.value = generateUserToken()
  navigateTo('/schnelle-welle')
}

const generateUserToken = () => {
  return Date.now().toString() + Math.random().toString(36)
}

if (userToken.value) {
  navigateTo('/')
}
</script>

<template>
  <NewUserModal
      :show="true"
      @start-daily-challenge="handleDailyChallenge"
      @start-quick-quiz="handleQuickQuiz"
      @close="navigateTo('/')"
  />
</template>
