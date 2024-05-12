<script lang="ts">
  import { entityTracker } from "$lib/store/entity-tracker";
</script>

{#if $entityTracker}
  <div class="entity-tracker">
    <div class="name">{$entityTracker.name} | lvl {$entityTracker.level}</div>
    <div class="bar hp">
      <div class="text">{$entityTracker.stats.hp} / {$entityTracker.stats.maxHp}</div>
      <div
        class="fill"
        style:width={(($entityTracker.stats.hp || 1) / ($entityTracker.stats.maxHp || 1)) * 100 + '%'}
      />
    </div>
  </div>
{/if}

<style lang="scss">
  .entity-tracker {
    position: absolute;
    background-color: var(--background);
    border: 1px solid var(--tetriary);
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    top: 20px;
    right: 20px;
    z-index: var(--zi-game-hud);
    min-width: 300px;
    
    .bar {
      position: relative;
      height: 20px;
      margin: 5px 0;
      border-bottom: 1px solid var(--secondary);
      background-color: var(--background);

      .text {
        position: absolute;
        width: 100%;
        text-align: center;
      }

      .fill {
        height: 100%;
      }
    }

    .hp .fill {
			background-color: var(--hp);
		}
  }
</style>