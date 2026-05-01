# Adding a route

Routing uses `react-router-dom` with `HashRouter` (Electron has no server URLs).

## Steps

1. Create `apps/desktop/src/renderer/app/<route>/page.tsx` exporting a `XxxPage` component.
2. Add the `<Route>` to `apps/desktop/src/renderer/app.tsx`.
3. Co-locate route-only components in `apps/desktop/src/renderer/app/<route>/_components/<name>.tsx`. Components reused across routes go in `apps/desktop/src/renderer/_components/`.
4. Wrap the page in `<AppShell crumbs={[...]}>` for the standard header + breadcrumb.

## Example

```tsx
// apps/desktop/src/renderer/app/example/page.tsx
import { AppShell } from "@/_components/app-shell";
import { Card, CardHeader, CardTitle } from "@playbook/ui";

export function ExamplePage() {
  return (
    <AppShell crumbs={[{ label: "Example" }]}>
      <Card>
        <CardHeader>
          <CardTitle>Hello</CardTitle>
        </CardHeader>
      </Card>
    </AppShell>
  );
}
```

```tsx
// apps/desktop/src/renderer/app.tsx
<Route path="/example" element={<ExamplePage />} />
```

## Conventions

- Page components are exported, named `XxxPage`. The file is `page.tsx` to mirror Next.js' convention used in tup/praxxi.
- Use `useParams<{ ... }>()` and check that params + `settings.platformFolder` are present before rendering data.
- Trigger `store.load(...)` in a `useEffect` keyed by the relevant context (platform/opponent/match).
