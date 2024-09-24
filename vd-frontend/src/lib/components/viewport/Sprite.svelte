<script lang="ts">
	export let spriteId: string;
</script>

<div class="sprite s-{spriteId.replaceAll(' ', '-').toLocaleLowerCase()}"></div>

<style>
	.sprite {
		width: 100%;
		height: 100%;
		background-size: 100%;
		image-rendering: pixelated;
	}

	.s-warrior {
		background-image: url('$lib/assets/char/warrior/idle.gif');
	}

	.s-char-blood-knight {
		background-image: url('$lib/assets/char/classes/blood-knight.gif');
	}

	.s-char-berserk {
		background-image: url('$lib/assets/char/classes/berserk.gif');
	}

	.s-char-battle-mage {
		background-image: url('$lib/assets/char/classes/mage.gif');
	}

	.s-char-shadow-monk {
		background-image: url('$lib/assets/char/classes/monk.gif');
	}

	.s-char-toxin-rogue {
		background-image: url('$lib/assets/char/classes/rogue.gif');
	}

	.s-monster1 {
		background-image: url('$lib/assets/entities/monsters/monster1.gif');
	}

	.s-goblin {
		background-image: url('$lib/assets/entities/monsters/monster1.gif');
	}

	.s-snake {
		background-image: url('$lib/assets/entities/monsters/snake.gif');
	}

	.s-vampire {
		background-image: url('$lib/assets/entities/monsters/vampire.gif');
	}

	.s-wolf {
		background-image: url('$lib/assets/entities/monsters/wolf.gif');
	}

	.s-skeleton {
		background-image: url('$lib/assets/entities/monsters/skeleton.gif');
	}

	.s-orc {
		background-image: url('$lib/assets/entities/monsters/orc.gif');
	}

	.s-living-armor {
		background-image: url('$lib/assets/entities/monsters/living-armor.gif');
	}

	.s-skeleton-warrior {
		background-image: url('$lib/assets/entities/monsters/skeleton-warrior.gif');
	}

	.s-orc-warrior {
		background-image: url('$lib/assets/entities/monsters/orc-warrior.gif');
	}

	.s-dark-elf-scout {
		background-image: url('$lib/assets/entities/monsters/dark-elf-scout.gif');
	}

	.s-ghoul {
		background-image: url('$lib/assets/entities/monsters/ghoul.gif');
	}

	.s-orc-shaman {
		background-image: url('$lib/assets/entities/monsters/orc-shaman.gif');
	}

	.s-werewolf {
		background-image: url('$lib/assets/entities/monsters/werewolf.gif');
	}

	.s-treasure-chest {
		background-image: url('$lib/assets/entities/other/treasure-chest.png');
	}

	.s-the-merchant {
		background-image: url('$lib/assets/entities/npc/merchant.gif');
	}

	.s-the-portal {
		background-image: url('$lib/assets/entities/npc/the-portal.gif');
	}

	.s-the-doctor {
		background-image: url('$lib/assets/entities/npc/plague_doctor.gif');
	}
</style>
