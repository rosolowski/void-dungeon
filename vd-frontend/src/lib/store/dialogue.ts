import { dialogueTree } from '$lib/util/dialogue-tree';
import { writable, get } from 'svelte/store';

export type DialogueOption = {
  text: string;
  nextId: number | null;
  action?: () => void;
};

export type DialogueLine = {
  text: string;
  options: DialogueOption[];
};

export type DialogueState = {
  currentId: number | null;
  currentLine: DialogueLine | null;
};

export const dialogueState = writable<DialogueState>({
  currentId: null,
  currentLine: null,
});

export function progressDialogue(id: number | null) {
  if (id === null) {
    dialogueState.set({ currentId: null, currentLine: null });
    return;
  }

  const line = dialogueTree[id];
  if (line) {
    dialogueState.set({ currentId: id, currentLine: line });
  } else {
    console.error(`Dialogue id ${id} not found`);
    dialogueState.set({ currentId: null, currentLine: null });
  }
}

export function selectOption(index: number) {
  const state = get(dialogueState);
  if (state.currentLine && state.currentLine.options[index]) {
    const option = state.currentLine.options[index];
    if (option.action) {
      option.action();
    }
    console.log('going to ', option.nextId);
    progressDialogue(option.nextId);
  }
}