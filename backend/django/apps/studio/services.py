def make_storyboard(project, assets):
    """Deterministic first-cut planner; replace with an LLM adapter behind this boundary."""
    screens = [str(asset.id) for asset in assets[:5]]
    return [
        {'type': 'hook', 'duration': 4, 'text': project.summary.split('.')[0][:120] or project.title, 'asset_ids': []},
        {'type': 'product_focus', 'duration': 10, 'text': project.title, 'asset_ids': screens[:3]},
        {'type': 'benefit', 'duration': 4, 'text': project.summary[:180], 'asset_ids': screens[3:]},
        {'type': 'cta', 'duration': 3, 'text': project.brand_kit.default_cta if project.brand_kit else 'Learn more', 'asset_ids': []},
    ]
