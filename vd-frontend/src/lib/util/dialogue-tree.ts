import MerchantWindow from "$lib/components/windows/MerchantWindow.svelte";
import type { DialogueLine } from "$lib/store/dialogue";
import { windows } from "$lib/store/windows";

function openMerchantWindow() {
  windows.openWindow({
    id: 'merchantWindow',
    title: 'The Merchant',
    component: MerchantWindow,
    props: {}
  });
}

export const dialogueTree: Record<number, DialogueLine> = {
  0: {
    text: 'Merchant: Welcome to my shop, what do you want to do?',
    options: [
      { text: 'Trade', nextId: 1 },
      { text: 'Leave', nextId: null }
    ]
  },
  1: {
    text: 'Merchant: Sure thing, take a look at my wares!',
    options: [
      { text: 'Ok', nextId: null, action: openMerchantWindow },
    ]
  },
};