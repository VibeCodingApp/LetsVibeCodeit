import { SponsorBanner } from './sponsor-banner';

export function SponsorBar() {
  return (
    <div className="py-5 border-y border-[var(--border)]">
      <div className="container-main">
        <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.08em] text-muted-2 font-mono mb-4">
          <span className="h-px flex-1 bg-[var(--border)]" /><span>Sponsored</span><span className="h-px flex-1 bg-[var(--border)]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
          <SponsorBanner name="WishKit" url="https://wishkit.io" description="Feature requests & changelog" tier="gold" />
          <SponsorBanner name="Gojiberry AI" url="https://gojiberry.ai" description="AI customer analytics" tier="silver" />
          <SponsorBanner name="SEO Stuff" url="https://seostuff.com" description="All-in-one SEO toolkit" tier="silver" />
          <SponsorBanner name="Postiz" url="https://postiz.com" description="Social media scheduling" tier="silver" />
        </div>
        <div className="text-center mt-4">
          <a href="/sponsor" className="text-[11px] font-mono text-muted-2 hover:text-muted no-underline transition-colors">+ your product — $1,799/30 days →</a>
        </div>
      </div>
    </div>
  );
}

export function SponsorSidebar() {
  return (
    <div className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0 pt-4">
      <SponsorBanner name="WishKit" url="https://wishkit.io" description="Feature requests & changelog tool" tier="gold" />
      <SponsorBanner name="Gojiberry AI" url="https://gojiberry.ai" description="AI analytics without a data team" tier="silver" />
      <SponsorBanner name="PostFast" url="https://postfast.app" description="Schedule posts everywhere" tier="silver" />
      <SponsorBanner name="ScreenSnap Pro" url="#" description="Beautiful marketing screenshots" tier="silver" />
    </div>
  );
}
