<script lang="ts">
  import EnvopsLogo from "../reusable/envops-logo/envops-logo.svelte";
  import { LightSwitch } from "../../theme";
</script>

<nav class="sticky top-0 left-0 bg-base-100 navbar px-4 shadow border-b">
  <div class="navbar-start">
    <EnvopsLogo />
  </div>
  <div class="navbar-center"></div>
  <div class="navbar-end">
    <LightSwitch />
  </div>
</nav>
