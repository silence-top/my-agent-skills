# Vendored：ui-ux-pro-max

本目录是 [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 的完整 vendored 副本，作为 ui-craft 的设计智能底座随本仓库分发（MIT License，见 [LICENSE](LICENSE)）。

- 上游版本：2.13.0（见 [skill.json](skill.json)）
- vendored commit：`dcc40ff5133ef78276117db0cc34e7b83cc8aeba`（2026-09-24 同步）
- 来源：上游 `.claude/skills/ui-ux-pro-max/`（SKILL.md、data/、references/、scripts/）+ 根目录 LICENSE、skill.json

## 本地改动

仅一处：SKILL.md 中检索脚本路径由 `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py` 改为相对本技能目录的 `scripts/search.py`（本目录安装到任何技能根后仍然成立）。其余文件原样未动。

## 未包含

- `scripts/tests/` 及其 fixtures（上游测试套件，运行时不需要）
- 上游 `src/` 打包源、各平台 README、`.claude-plugin/` 与 CLI 安装器

## 更新方法

1. `git clone --depth 1 --filter=blob:none --sparse https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git <临时目录>`，`git -C <临时目录> sparse-checkout set src/ui-ux-pro-max .claude/skills/ui-ux-pro-max`
2. 用上游 `.claude/skills/ui-ux-pro-max/` 覆盖本目录的 SKILL.md、data/、references/、scripts/，并重新应用上面的路径补丁
3. 复制新的 LICENSE、skill.json，更新版本号与 commit
4. 冒烟：`python scripts/search.py "error summary validation" --domain ux -n 1`
