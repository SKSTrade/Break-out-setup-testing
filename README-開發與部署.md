# Break out setup testing｜Research V0.1（App V0.1.2｜London→NY延續版）

## 獨立系統／隔離說明

本資料夾是完整、獨立、離線可用的 Progressive Web App（PWA），**不是現有 Master Trade Journal V1.30.35 的補丁**。請部署到**另外一個資料夾或子網站**，唔好覆蓋舊App檔案：

- 建議：`/breakout-research/`；舊Master Trade App維持原本路徑。
- 研究紀錄 localStorage key：`breakoutResearchV01Records`；不讀取舊Journal的 `masterTradePracticeJournalV1Records`。
- 本地截圖 IndexedDB：`breakoutResearchV01Images`；不讀取舊Journal的圖庫。
- PWA cache：`breakout-research-v0.1.2-20261104-r4`；不刪除非本Project cache。
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
- Break + Hold + Extend缺一不可，亦必須 First Valid Retest；FX/XAU必須London發生Break，但可於同一交易週期New York完成BHE、首次有效Retest及Entry。
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


## Research V0.1.2｜FX／XAU London Breakout 延續至NY（2026-11-04）

- **獨立App**，Master Trade V1.30.35 檔案同儲存空間均未修改。
- FX／XAU只有London可以形成原始Asia H/L Break；BHE、首次有效Retest及Entry可於London或New York，必須是同一交易週期。
- BHE Completed Session、Entry Session均明確紀錄；Breakout Session固定London。
- 原London突破若Break-Accept失效、出現更早Retest、或NY重新獨立突破：Invalid／Skip。
- NY先完成BHE亦接受，但不允許NY完成BHE後將Entry Session填London。
- 新增跨Session連續性手動確認：`原London Breakout仍然有效` 必須勾選；`已出現更早Retest`、`NY重新突破` 必須保持未勾選；填寫實際Entry Session及BHE Completed Session，並勾選Session內入場。
- HSI／GER40沿用原Opening Session選項，唔受新判斷影響。
- 既有V0.1.1 records及CSV缺少跨Session欄位時，按照舊規則視為London-only（只作舊檔兼容，並非事後驗證NY延續）。
- 研究統計新增Entry Session / BHE Completed Session分組，用於研究NY延遲入場。
- Research sizing、Raw P、Q、Hard Veto、0-size記錄均不變；不套V1.4 Production/Shadow Rules。


## V0.1.3｜All-Market Master Trade Matrix｜完整判斷（Research-only）
- 計算器新增原版 V1.30.35 風格嘅完整判斷結果面板（主次Judge、Gap、Session、Opening Context、Raw P/Native Q、BHE、Risk、Research Base/Final、Skip原因）。
- History 紀錄詳情可以展開同一套完整判斷；直接用紀錄內輸入重算（唔會改寫已儲存注碼或交易資料）。
- 完整判斷由獨立 `judgment.js` 提供，直接讀 `engine.js` 嘅結果，唔會執行 Master Trade V1.4 Rule 1–4、E升格或Runner。
- 本次為呈現層更新；Research V0.1 sizing、Session rules、localStorage key、IndexedDB key、CSV schema以及原有 Master Trade V1.30.35 全部不變。


## V0.1.4｜表單預設／Opening Context／風險欄位
- Opening Context按Pre-open Direction及Main/Effective Secondary Direction Permission分類；未完成BHE/Retest不阻止方向分類。未分類時區分Range方向未確認、Direction Permission不符合。
- Validation 預設Yes：Reference Range、Breakout Session、Break、Hold、Extend、Entry Session；預設No：First Valid Retest、First Retest in Allowed Session。只影響新建／Reset表單；舊紀錄保持記錄值。
- Entry TF預設：HSI、GER40 = 1M；EURUSD、GBPUSD、USDCHF、XAUUSD = 15M；切換商品時自動更新；編輯既有紀錄保留原TF。
- 移除RR、Clean Expansion Space數值欄位及其舊資料自動Veto；仍保留其他明示Hard Veto。新版CSV不輸出該兩欄，舊CSV仍可讀入，其舊RR/Space值不再參與size計算。
- 此版本維持舊研究資料鍵值、研究版本與獨立儲存，不會修改Master Trade。


## V0.1.5｜右側快速跳轉（純介面更新）

參考 Master Trade V1.30.35：桌面寬螢幕右側固定快速跳轉面板，窄螢幕／手機以「章節 ↑」按鈕展開。可直接跳往「紀錄／產品、Market State、Location／Q、Breakout／Retest、Risk／Sizing、完整判斷、結果／儲存」或返回頂部。

使用平滑捲動及適當 header offset；支援 Escape、按外側關閉；切換到紀錄庫／研究統計／研究規則頁會隱藏。只新增 section DOM id／CSS／navigation listeners，不改 sizing engine、Research V0.1 規則、CSV schema、localStorage 或 IndexedDB。
