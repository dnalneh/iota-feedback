<template>
   <div class="spinner">
    <img src="@/assets/loading.svg" alt="loading"/>
  </div>
</template>

<script>
export default {
  name: "callback",
  mounted() {
    this.$auth.handleAuthentication().then(data => {
      this.$router.push({ name: "home" });
    });
  }
};
</script>

<style scoped>
</style>