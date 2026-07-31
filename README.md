# GeoMaster

HTML + JavaScriptで幾何描画を組み立てるための、依存関係なしの小型ワークベンチです。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/TomTomYoung/GeoMaster/blob/main/colab/geomaster.ipynb)

## 現在の機能

- 点
- 線分
- 直線
- 半直線
- 円
- グリッド表示
- グリッドスナップ
- パン・ズーム
- Undo / Clear
- シーンのJSON表示・コピー

## ローカル実行

ES Modulesを使うため、ファイルを直接開かずHTTPサーバーから起動します。

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## Google Colab

README上部の `Open In Colab` を押すか、次のURLを開きます。

```text
https://colab.research.google.com/github/TomTomYoung/GeoMaster/blob/main/colab/geomaster.ipynb
```

公開リポジトリなので、Colabからclone・pullするだけならGitHubトークンは不要です。

## 構成

```text
GeoMaster/
├─ index.html
├─ src/
│  ├─ app.js
│  ├─ geometry.js
│  ├─ interaction.js
│  └─ renderer.js
└─ colab/
   └─ geomaster.ipynb
```

## 操作

- Point: 1クリックで点を配置
- Segment / Line / Ray / Circle: 2クリックで作成
- マウスホイール: ズーム
- 右ドラッグ・中ドラッグ・Alt+ドラッグ: パン
- Ctrl+Z / Cmd+Z: Undo
- Esc: 作成途中のキャンセル

## 今後の候補

交点、垂線、平行線、中点、角度、長さ拘束、オブジェクト選択、移動、削除、保存・読込、SVG出力を順次追加できます。
