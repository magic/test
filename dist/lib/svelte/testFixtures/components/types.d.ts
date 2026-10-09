import type { SvelteComponent } from 'svelte'
export interface ToggleComponent extends SvelteComponent {
  on: boolean
}
export interface CounterWithPropsComponent extends SvelteComponent {
  count: number
}
export interface ListComponent extends SvelteComponent {
  itemsList: Array<{
    id: number
    text: string
  }>
}
export interface ListItemComponent extends SvelteComponent {
  item: {
    text: string
  }
}
export interface InputComponent extends SvelteComponent {
  inputValue: string
  changed: boolean
}
export interface DerivedComponent extends SvelteComponent {
  count: number
  doubleCount: number
  isEmpty: boolean
  isLarge: boolean
}
export interface ButtonComponent extends SvelteComponent {
  disabled: boolean
}
export interface TabsComponent extends SvelteComponent {
  activeTab: string | null
}
export interface CardComponent extends SvelteComponent {
  title: string
  bordered: boolean
}
