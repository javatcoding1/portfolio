performance.mark("portfolio-init");

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  performance.clearMarks("portfolio-route-start");
  performance.mark("portfolio-route-start", {
    detail: { url, navigationType },
  });
}
