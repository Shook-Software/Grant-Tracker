export const flex = {
  centered: `
		display: flex;
		justify-content: center;
		align-items: center;
	`
}

export const standardInput = `
	width: 100%;
	padding: 0.375rem 0.75rem;
	border: 1px solid var(--bs-gray-300);
	border-radius: 0.25rem;
`

export const onHoverBehavior = `
	&:hover {
		user-select: none;
    background-color: rgba(80, 175, 247, 0.95);
    text-decoration: underline 1px black;
    cursor: pointer;
  }
`
//this is dumb, use an scss file and @mixin
