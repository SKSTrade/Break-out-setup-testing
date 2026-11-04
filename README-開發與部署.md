# Break out setup testing｜Research V0.1（介面修訂 V0.1.1）

## 獨立系統／隔離說明

本資料夾是完整、獨立、離線可用的 Progressive Web App（PWA），**不是現有 Master Trade Journal V1.30.35 的補丁**。請部署到**另外一個資料夾或子網站**，唔好覆蓋舊App檔案：

- 建議：`/breakout-research/`；舊Master Trade App維持原本路徑。
- 研究紀錄 localStorage key：`breakoutResearchV01Records`；不讀取舊Journal的 `masterTradePracticeJournalV1Records`。
- 本地截圖 IndexedDB：`breakoutResearchV01Images`；不讀取舊Journal的圖庫。
- PWA cache：`breakout-research-v0.1-20261104-r3`；不刪除非本Project cache。
- CSV有獨立 Project Name/Research Version 檢查，拒絕把Master Trade CSV直接匯入。
- 沒有任何 V1.4 E、P2-E、Production Rule 1/3、Shadow Rule 2/4 之判斷或調用。

## 使用方法

1. 解壓ZIP並將整個 `BreakoutResearchV0_1` 資料夾部署到HTTPS網站，或本機用簡易HTTP Server開啟。例如在資料夾上一層執行 `python -m http.server 8080`，開啟 `http://localhost:8080/BreakoutResearchV0_1/`。本地開檔 `file://` 可使用基本頁面，但無法安裝PWA；瀏覽器對 localStorage 亦可能有限制。
2. 計算器輸入完整的 Main/Secondary Market State、Gap、Opening Context、BHE、First Retest、Raw P、Native Q。
3. 新App以使用者確認形式紀錄價格行為：不會自創BHE最少幾Bar、開市前方向之客觀新門檻。請依原V1.4已凍結標準填寫。
4. 完整Setup但Research Size=0仍可輸入Normalized R/MFE/MAE/RF，Actual R強制為0。
5. History支援多選篩選、勾選匯出CSV、另行匯出已選截圖ZIP；CSV不包含圖片二進位（需另外備份）。
6. Import僅接受本研究App匯出嘅CSV。同ID覆蓋，未知ID新增；所有自動計算欄重新按V0.1 engine生成。

## 研究規則

- 產品：HSI(OPR)、GER40(POR)、EURUSD/GBPUSD/USDCHF/XAUUSD(Asia H/L → London)。
- Market States七態及Secondary Structural Gap：Gap OFF=Official；Gap ON=Working，必須有合格Trigger 1/2。只有Main同Effective Secondary為同方向Healthy/Weak，且交易方向順兩者，先可交易。
- Break + Hold + Extend缺一不可，亦必須 First Valid Retest；FX/XAU London時段內完成突破和Retest。
- Range Breakout前方向須可判斷，先可分「順向順勢」「反向順勢」。未分類者記Skip，不污染統計。
- Raw P=Research P，絕不升P2-E；Q3須獨立判斷，BHE不會自動升級Q3；Q2 subtype可多選（包含R/F/S/D/RR/Structured）。
- 雙Healthy同向：P1/P2 Q3=1，Q2=.5；P3 Q3=.5，Q2=.25；其餘0。
- 同向至少一Weak：P1/P2 Q3=.5，Q2=.25；P3 Q3=.25，Q2=0；其餘0。
- V1.4 Rule 1–4全部不適用，F+S不額外降注。
- RR有輸入時 <1.5、Clean Expansion Space有輸入時<2R 依原擴展交易風險標準跳過；原有Hard Veto仍由交易者判斷。空白數字唔會被程式捏造價位。
- TP2僅MFE≥4R自動 Yes；MFE空白係未有資料。Time to RF填H/M會將Reached RF設Yes。
- 主研究績效只包括 **Live/Practice + Executable Entry**；Review、有效0注、Invalid/Skipped各自分開。
- Actual R=Normalized R×Final Research Size；0注Setup的Hypothetical Normalized R不會被混入Actual R。

## 欄位資料完整性／研究限制

- 只用瀏覽器儲存，清除瀏覽器網站資料或改用其他裝置會令紀錄消失，請定期匯出CSV及圖片ZIP。
- 研究統計按現有保存紀錄計算；0筆數值樣本不會當成勝率0%。
- CSV匯入有BOM及RFC4180報價欄處理，但部分Excel使用本地化分隔符（分號）嘅CSV需要先另存為標準逗號分隔UTF-8。
- Price Action qualifiers、RR／hard obstacles、Session有效性依舊規則由用戶判斷。App不能從只得checkbox嘅資料獨立驗證現實圖表。
- 原Journal Match係風險標籤，唔會自行合併原有Journal或替你自動去重Portfolio。

## File structure

- `index.html` — UI。
- `styles.css` — 參考 V1.30.35 深色主題視覺語言，獨立UI。
- `engine.js` — 獨立、可單元測試之 Research V0.1 sizing engine。
- `app.js` — Journal、IndexedDB圖片、CSV、History Filter、Research Stats。
- `service-worker.js`, `manifest.webmanifest`, `icons/` — 獨立 PWA 資源。
- `tests/` — Node engine unit/regression tests。

- Native Q分類由交易者按V1.4原有Price Action/Q2標準**手動判定**，程式不會根據BHE自動「升Q3」。只會自動計算由Native Q得出嘅Research Size。

## V0.1.1介面更新（不更改研究計算）

- 截圖區可直接點擊後按 Ctrl+V（Windows）／⌘+V（Mac）貼上圖片；支援連續貼多張、拖放、原有檔案上傳，並可移除待儲存圖片。按「儲存研究紀錄」後才存入本Project專用IndexedDB。
- 部分HTTPS環境可使用「從剪貼簿加入圖片」按鈕，若瀏覽器拒絕授權，請用Ctrl+V／⌘+V。
- 表單及新版CSV移除「Breakout時間（可選）」「First Retest時間（可選）」「入場時間（可選）」。**BHE→First Retest（H/M）**、Time to RF及Exit時間仍保留。
- 舊CSV即使帶有已移除的三個欄，仍可讀取其餘欄位；匯出時不會再包含三個欄。研究版本識別仍維持 `Research V0.1`，避免造成既有CSV匯入中斷。
