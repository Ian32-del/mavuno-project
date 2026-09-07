import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/README')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/README"!</div>
}
