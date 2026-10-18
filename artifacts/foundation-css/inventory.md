# INGLY Sprint 01 — Inventario CSS

Static estimate; theme/media overrides are not necessarily errors.

| Metric | Count |
|---|---:|
| stylesheets | 25 |
| rulesApprox | 3971 |
| repeated | 583 |
| withDivergentProperties | 464 |
| importantDeclarations | 2440 |

## index.html
1. assets/css/reset.css
2. assets/css/variables.css
3. assets/css/animations.css
4. assets/css/layout.css
5. assets/css/components.css
6. assets/css/nav-ia.css
7. assets/css/pages.css
8. assets/css/responsive.css
9. assets/css/premium-2026.css
10. assets/css/atelier-foundation.css
11. assets/css/notte-oro.css
12. assets/css/ingly-user-loader.css
13. assets/css/signature-showcase.css
14. assets/css/maison-reference.css
15. assets/css/ingly-studio-refinement.css
16. assets/css/ingly-josefin-studio.css
17. assets/css/ingly-responsive-theme.css
18. assets/css/foundation-components.css
19. assets/css/real-photography.css
20. assets/css/ingly-immersive-2026.css
21. assets/css/ux-fluidity-sprint16.css
22. assets/css/brand-system-2026.css

## admin.html
1. assets/css/admin-notte-oro.css
2. assets/css/admin-maison.css
3. assets/css/foundation-components.css
4. assets/css/admin-brand-system.css

## header

| Selector | Rules | Files | Conflicting properties |
|---|---:|---|---|
| :root[data-mode] .ia-pannello | 5 | assets/css/atelier-foundation.css, assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/maison-reference.css | background, color, box-shadow, border-radius, border |
| :root[data-mode] .nav .brand>span | 4 | assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/maison-reference.css, assets/css/ingly-josefin-studio.css | font-family, font-weight, letter-spacing, font, color |
| .ia-freccia | 3 | assets/css/nav-ia.css | width, height, color, border-radius, transition |
| .brand img | 7 | assets/css/layout.css, assets/css/nav-ia.css, assets/css/pages.css, assets/css/admin-maison.css | width, height, transition, filter |
| :root[data-mode] .nav,
:root[data-mode] .nav.scrolled | 2 | assets/css/signature-showcase.css, assets/css/maison-reference.css | background, box-shadow, backdrop-filter, -webkit-backdrop-filter |
| :root[data-mode] #nav.nav a.brand--identity > img.brand-symbol | 2 | assets/css/brand-system-2026.css | width, height, min-width, max-width |
| .ia-pannello | 6 | assets/css/nav-ia.css, assets/css/pages.css | background, border-top, box-shadow |
| .ia-lista a | 5 | assets/css/nav-ia.css, assets/css/pages.css | border-radius, transition, color |
| :root[data-mode] .nav | 5 | assets/css/atelier-foundation.css, assets/css/notte-oro.css | box-shadow, padding-block, transition |
| :root[data-mode] .nav .brand small | 4 | assets/css/atelier-foundation.css, assets/css/signature-showcase.css, assets/css/maison-reference.css, assets/css/ingly-josefin-studio.css | letter-spacing, font, color |
| :root[data-mode] .brand--admin .brand-admin-lockup img.brand-wordmark | 4 | assets/css/admin-brand-system.css | width, max-height, aspect-ratio |
| .ia-voce | 3 | assets/css/nav-ia.css | font-size, letter-spacing, padding |
| :root[data-mode="light"] .nav,:root[data-mode="light"] .nav.scrolled | 3 | assets/css/pages.css | background, box-shadow, border-bottom-color |
| :root[data-mode="light"] .ia-pannello | 3 | assets/css/pages.css | background, color, border-top-color |
| :root[data-mode] .nav .brand img | 3 | assets/css/atelier-foundation.css, assets/css/signature-showcase.css, assets/css/maison-reference.css | width, height, filter |
| .ia-voce::after | 2 | assets/css/nav-ia.css | left, right, background |
| .nav,.nav.scrolled | 2 | assets/css/pages.css | background, border-bottom, box-shadow |
| .ia-velo | 5 | assets/css/nav-ia.css, assets/css/pages.css | background, backdrop-filter |
| :root[data-mode] .nav .nav-in | 4 | assets/css/atelier-foundation.css, assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/brand-system-2026.css | max-width, gap |
| .nav | 3 | assets/css/layout.css, assets/css/components.css, assets/css/nav-ia.css | top, transition |
| .brand | 3 | assets/css/layout.css, assets/css/pages.css, assets/css/admin-maison.css | font-family, letter-spacing |
| .mobile-menu | 3 | assets/css/layout.css, assets/css/nav-ia.css, assets/css/pages.css | justify-content, padding |
| .ia-barra | 3 | assets/css/nav-ia.css | display, gap |
| .ia-lista a:hover,.ia-lista a:focus-visible | 3 | assets/css/nav-ia.css, assets/css/pages.css | background, color |
| .nav-links a | 2 | assets/css/layout.css, assets/css/components.css | font-size, padding |

## cta

| Selector | Rules | Files | Conflicting properties |
|---|---:|---|---|
| .btn | 6 | assets/css/layout.css, assets/css/components.css, assets/css/pages.css, assets/css/responsive.css, assets/css/admin-notte-oro.css, assets/css/admin-maison.css | font-family, font-size, padding, border-radius, transition, will-change, min-height, background, border, color |
| :root[data-mode] #page-home .signature-hero .hero-ctas .btn | 8 | assets/css/signature-showcase.css, assets/css/brand-system-2026.css | min-height, justify-content, padding, border-radius, flex |
| :root[data-mode] :is(.btn-primary,.btn-blue,.atelier-nav-cta) | 5 | assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/maison-reference.css, assets/css/ingly-responsive-theme.css, assets/css/brand-system-2026.css | background, color, border, box-shadow, border-radius |
| .btn-blue | 4 | assets/css/layout.css, assets/css/pages.css | background, color, box-shadow, border-color |
| :root[data-mode] .btn-ghost | 4 | assets/css/atelier-foundation.css, assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/maison-reference.css | background, border, color, backdrop-filter |
| :root[data-mode] .btn | 3 | assets/css/atelier-foundation.css, assets/css/notte-oro.css | border-radius, min-height, padding, font-weight |
| .btn-primary,.btn.pri | 2 | assets/css/pages.css | color, background, border, box-shadow |
| :root[data-mode="light"] .btn-ghost | 5 | assets/css/variables.css, assets/css/pages.css | border-color, color, background |
| :root[data-mode="light"] .btn-ghost:hover | 5 | assets/css/variables.css, assets/css/pages.css | border-color, color, background |
| .btn-ghost | 5 | assets/css/layout.css, assets/css/pages.css | border-color, background, color |
| .btn-ghost:hover | 5 | assets/css/pages.css | border-color, color, background |
| .btn-primary | 3 | assets/css/layout.css, assets/css/pages.css | background, color, box-shadow |
| :root[data-mode] :is(.btn-primary,.btn-blue) | 3 | assets/css/atelier-foundation.css, assets/css/ingly-responsive-theme.css | color, background, box-shadow |
| .btn-primary:hover,.btn.pri:hover | 2 | assets/css/pages.css | color, background, box-shadow |
| .btn.pri | 2 | assets/css/admin-notte-oro.css, assets/css/admin-maison.css | background, color, box-shadow |
| :root[data-mode] :is(.btn-primary,.btn-blue,.atelier-nav-cta):hover | 4 | assets/css/notte-oro.css, assets/css/signature-showcase.css, assets/css/maison-reference.css, assets/css/ingly-responsive-theme.css | filter, box-shadow |
| .qadd | 3 | assets/css/components.css, assets/css/pages.css | background, color |
| .btn-primary:hover | 2 | assets/css/pages.css | background, box-shadow |
| .news,.cta-band | 2 | assets/css/pages.css | background, box-shadow |
| footer,.news,.cta-band | 2 | assets/css/pages.css | background, border-color |
| :root[data-mode="light"] footer,:root[data-mode="light"] .news,:root[data-mode="light"] .cta-band | 2 | assets/css/pages.css | background, color |
| :root[data-mode] :is(.btn-ghost,.btn-secondary) | 2 | assets/css/ingly-responsive-theme.css, assets/css/brand-system-2026.css | background, color |
| .hero-ctas .btn | 3 | assets/css/pages.css, assets/css/premium-2026.css | min-height |
| .btn:hover | 3 | assets/css/pages.css, assets/css/admin-notte-oro.css, assets/css/admin-maison.css | border-color |
| .pcard:hover .qadd | 2 | assets/css/components.css | transform |

## card

| Selector | Rules | Files | Conflicting properties |
|---|---:|---|---|
| :root[data-mode] :is(.rcard,.vert-card,.journey-card,.lab-card,.mcard,.pcard,.p-card,.bcard,.dcard,.ingly-material-tile,.ingly-biz-service):hover | 3 | assets/css/atelier-foundation.css | border-color, box-shadow, transform |
| .pcard,.dcard,.rcard,.matcard,.bcard:not(.bcard--photo):not(.bcard--gen) | 2 | assets/css/pages.css | background, border-color, box-shadow |
| .card,.panel,.box,.modal,.drawer,.editor | 2 | assets/css/admin-notte-oro.css, assets/css/admin-maison.css | background, border, box-shadow |
| .pcard:hover,.dcard:hover | 2 | assets/css/pages.css | box-shadow, border-color |
| :root[data-mode] :is(.rcard,.vert-card,.journey-card,.lab-card,.mcard,.pcard,.p-card,.bcard,.dcard,.ingly-material-tile,.ingly-biz-service) | 2 | assets/css/atelier-foundation.css | backdrop-filter, -webkit-backdrop-filter |
| .dcard,.admin-launch | 2 | assets/css/admin-notte-oro.css, assets/css/admin-maison.css | background, border-color |
| .pcard | 3 | assets/css/components.css | transition |
| .pcard:hover | 3 | assets/css/components.css | transform |
| :root[data-mode="light"] .pcard | 2 | assets/css/variables.css | background |
| :root[data-mode="light"] .pcard:hover | 2 | assets/css/variables.css | box-shadow |
| .pcard:hover .qadd | 2 | assets/css/components.css | transform |
| .dcard .dig-cop | 2 | assets/css/pages.css | height |
| .card h3 | 2 | assets/css/admin-notte-oro.css, assets/css/admin-maison.css | color |
| .pcard .pimg | 2 | assets/css/components.css |  |
| .pcard .pimg .art | 2 | assets/css/components.css |  |
| .pcard:hover .pimg .art | 2 | assets/css/components.css |  |
| .dcard | 2 | assets/css/components.css, assets/css/pages.css |  |

## modal

| Selector | Rules | Files | Conflicting properties |
|---|---:|---|---|
| .card,.panel,.box,.modal,.drawer,.editor | 2 | assets/css/admin-notte-oro.css, assets/css/admin-maison.css | background, border, box-shadow |
| .drawer | 2 | assets/css/components.css, assets/css/pages.css | box-shadow |

## footer

| Selector | Rules | Files | Conflicting properties |
|---|---:|---|---|
| :root[data-mode] .ft-cols | 8 | assets/css/atelier-foundation.css, assets/css/notte-oro.css | grid-template-columns, gap |
| footer | 5 | assets/css/components.css, assets/css/pages.css | background, color |
| :root[data-mode] footer | 4 | assets/css/atelier-foundation.css, assets/css/maison-reference.css, assets/css/brand-system-2026.css | background, color |
| :root[data-mode="light"] footer | 3 | assets/css/variables.css, assets/css/pages.css | background, border-top-color |
| .ft-cols | 3 | assets/css/nav-ia.css | grid-template-columns, gap |
| :root[data-mode] footer .ft-cols | 3 | assets/css/brand-system-2026.css | gap, grid-template-columns |
| footer,.news,.cta-band | 2 | assets/css/pages.css | background, border-color |
| :root[data-mode="light"] footer,:root[data-mode="light"] .news,:root[data-mode="light"] .cta-band | 2 | assets/css/pages.css | background, color |
| :root[data-mode] .ft-col--brand | 4 | assets/css/atelier-foundation.css, assets/css/notte-oro.css | margin-bottom |
| footer a:hover | 3 | assets/css/pages.css | color |
| :root[data-mode] footer .ingly-footer-signature | 3 | assets/css/brand-system-2026.css | overflow |
| footer a | 2 | assets/css/pages.css | color |
| :root[data-mode="light"] footer a | 2 | assets/css/pages.css | color |
| .ingly-footer-signature | 2 | assets/css/pages.css | gap |
| .ingly-footer-signature img | 2 | assets/css/pages.css | width |
| :root[data-mode] .ft-closing | 2 | assets/css/atelier-foundation.css | margin-bottom |
| :root[data-mode] footer a:hover | 2 | assets/css/notte-oro.css, assets/css/brand-system-2026.css | color |
| :root[data-mode] footer .ingly-footer-signature img | 2 | assets/css/brand-system-2026.css | width |
| :root[data-mode] footer .ingly-footer-signature img.brand-wordmark | 2 | assets/css/brand-system-2026.css | width |
| :root[data-mode="light"] footer .ingly-footer-signature img.brand-wordmark | 2 | assets/css/brand-system-2026.css | opacity |
| :root[data-mode] .ft-col a | 2 | assets/css/atelier-foundation.css |  |
| :root[data-mode] footer .ft-col--brand .brand--identity | 2 | assets/css/brand-system-2026.css |  |
