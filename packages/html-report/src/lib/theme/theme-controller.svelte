<script lang="ts">
  import { onMount } from "svelte";
  import { themeChange } from "theme-change";

  onMount(() => {
    const theme = localStorage.getItem("theme");

    if (!theme) {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      localStorage.setItem("theme", prefersDark ? "dark" : "Light");
    }

    themeChange(false);
  });
</script>
