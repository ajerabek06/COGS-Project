"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type CostItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  updated: string;
};

type Platform = {
  id: string;
  name: string;
  percent: number;
  fixed: number;
  payment: number;
};

type RecipeLine = {
  id: string;
  itemId: string;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  materials: RecipeLine[];
  labor: RecipeLine[];
  machines: RecipeLine[];
  shipping: RecipeLine[];
  platformIds: string[];
  markup: number;
  targetPrice: number;
  updated: string;
};

type AppData = {
  materials: CostItem[];
  labor: CostItem[];
  machines: CostItem[];
  shipping: CostItem[];
  platforms: Platform[];
  products: Product[];
};

type LibraryKey = "materials" | "labor" | "machines" | "shipping";
type View = "overview" | "products" | LibraryKey | "platforms";

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const formatMoney = (value: number) => money.format(Number.isFinite(value) ? value : 0);
const roundMoney = (value: number) => Math.ceil(value * 2) / 2;

const starterData: AppData = {
  materials: [
    { id: "mat-walnut", name: "Black walnut", category: "Hardwood", unit: "board ft", cost: 14.5, updated: "2026-07-18" },
    { id: "mat-maple", name: "Hard maple", category: "Hardwood", unit: "board ft", cost: 8.75, updated: "2026-07-12" },
    { id: "mat-ply", name: "Baltic birch plywood", category: "Sheet goods", unit: "sq ft", cost: 3.2, updated: "2026-07-14" },
    { id: "mat-oil", name: "Hardwax oil", category: "Finish", unit: "fl oz", cost: 1.85, updated: "2026-07-08" },
    { id: "mat-feet", name: "Brass furniture feet", category: "Hardware", unit: "each", cost: 3.4, updated: "2026-07-19" },
  ],
  labor: [
    { id: "lab-build", name: "Craftsperson — build", category: "Production", unit: "hour", cost: 32, updated: "2026-07-01" },
    { id: "lab-finish", name: "Finishing & detail", category: "Finishing", unit: "hour", cost: 36, updated: "2026-07-01" },
    { id: "lab-design", name: "Design & setup", category: "Design", unit: "hour", cost: 42, updated: "2026-07-01" },
  ],
  machines: [
    { id: "mac-cnc", name: "CNC router", category: "Cutting", unit: "machine hr", cost: 18, updated: "2026-07-10" },
    { id: "mac-sander", name: "Drum sander", category: "Sanding", unit: "machine hr", cost: 9.5, updated: "2026-07-10" },
    { id: "mac-laser", name: "Laser engraver", category: "Detailing", unit: "machine hr", cost: 12, updated: "2026-07-10" },
  ],
  shipping: [
    { id: "ship-box", name: "Double-wall box — medium", category: "Box", unit: "each", cost: 3.65, updated: "2026-07-16" },
    { id: "ship-paper", name: "Kraft packing paper", category: "Cushioning", unit: "sheet", cost: 0.18, updated: "2026-07-16" },
    { id: "ship-corner", name: "Foam corner protector", category: "Protection", unit: "each", cost: 0.42, updated: "2026-07-16" },
    { id: "ship-label", name: "Branded care card", category: "Insert", unit: "each", cost: 0.58, updated: "2026-07-16" },
  ],
  platforms: [
    { id: "plat-direct", name: "Direct / wholesale", percent: 0, fixed: 0, payment: 2.9 },
    { id: "plat-etsy", name: "Etsy", percent: 9.5, fixed: 0.45, payment: 3 },
    { id: "plat-shopify", name: "Shopify", percent: 0, fixed: 0.3, payment: 2.9 },
    { id: "plat-market", name: "Craft marketplace", percent: 12, fixed: 0.3, payment: 2.9 },
  ],
  products: [
    {
      id: "prod-board",
      name: "Walnut serving board",
      sku: "WSB-2401",
      description: "Hand-shaped black walnut serving board with brass feet and a food-safe hardwax finish.",
      materials: [
        { id: "line-1", itemId: "mat-walnut", quantity: 2.4 },
        { id: "line-2", itemId: "mat-oil", quantity: 1.5 },
        { id: "line-3", itemId: "mat-feet", quantity: 4 },
      ],
      labor: [
        { id: "line-4", itemId: "lab-build", quantity: 1.75 },
        { id: "line-5", itemId: "lab-finish", quantity: 0.75 },
      ],
      machines: [
        { id: "line-6", itemId: "mac-cnc", quantity: 0.35 },
        { id: "line-7", itemId: "mac-sander", quantity: 0.25 },
      ],
      shipping: [
        { id: "line-8", itemId: "ship-box", quantity: 1 },
        { id: "line-9", itemId: "ship-paper", quantity: 6 },
        { id: "line-10", itemId: "ship-corner", quantity: 4 },
        { id: "line-11", itemId: "ship-label", quantity: 1 },
      ],
      platformIds: ["plat-direct", "plat-etsy", "plat-shopify", "plat-market"],
      markup: 60,
      targetPrice: 189,
      updated: "2026-07-22",
    },
  ],
};

const blankProduct = (): Product => ({
  id: uid(),
  name: "Untitled product",
  sku: "",
  description: "",
  materials: [],
  labor: [],
  machines: [],
  shipping: [],
  platformIds: [],
  markup: 50,
  targetPrice: 0,
  updated: today(),
});

const nav: { id: View; label: string; short: string }[] = [
  { id: "overview", label: "Overview", short: "OV" },
  { id: "products", label: "Products", short: "PR" },
  { id: "materials", label: "Raw materials", short: "RM" },
  { id: "labor", label: "Labor types", short: "LB" },
  { id: "machines", label: "Machine time", short: "MT" },
  { id: "shipping", label: "Shipping supplies", short: "SP" },
  { id: "platforms", label: "Selling platforms", short: "PF" },
];

function lineCost(lines: RecipeLine[], items: CostItem[]) {
  return lines.reduce((sum, line) => sum + (items.find((item) => item.id === line.itemId)?.cost || 0) * line.quantity, 0);
}

function getProductCosts(product: Product, data: AppData) {
  const materials = lineCost(product.materials, data.materials);
  const labor = lineCost(product.labor, data.labor);
  const machines = lineCost(product.machines, data.machines);
  const shipping = lineCost(product.shipping, data.shipping);
  return { materials, labor, machines, shipping, total: materials + labor + machines + shipping };
}

function platformResult(price: number, baseCost: number, platform: Platform) {
  const fees = price * ((platform.percent + platform.payment) / 100) + platform.fixed;
  const profit = price - baseCost - fees;
  return { fees, profit, margin: price ? (profit / price) * 100 : 0 };
}

export default function Home() {
  const [data, setData] = useState<AppData>(starterData);
  const [view, setView] = useState<View>("overview");
  const [selectedId, setSelectedId] = useState("prod-board");
  const [editor, setEditor] = useState<Product>(starterData.products[0]);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("benchboard-cogs-v1");
      if (stored) {
        const parsed = JSON.parse(stored) as AppData;
        setData(parsed);
        if (parsed.products[0]) {
          setSelectedId(parsed.products[0].id);
          setEditor(parsed.products[0]);
        }
      }
    } catch {
      // Keep the useful starter data if a local backup is malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("benchboard-cogs-v1", JSON.stringify(data));
    setSaved(true);
    const timer = window.setTimeout(() => setSaved(false), 1400);
    return () => window.clearTimeout(timer);
  }, [data, hydrated]);

  const selected = data.products.find((product) => product.id === selectedId) || data.products[0];
  const costs = useMemo(() => getProductCosts(editor, data), [editor, data]);
  const suggestedPrice = roundMoney(costs.total * (1 + editor.markup / 100));

  const saveProduct = () => {
    const product = { ...editor, targetPrice: editor.targetPrice || suggestedPrice, updated: today() };
    setData((current) => ({
      ...current,
      products: current.products.some((item) => item.id === product.id)
        ? current.products.map((item) => (item.id === product.id ? product : item))
        : [...current.products, product],
    }));
    setEditor(product);
    setSelectedId(product.id);
  };

  const chooseProduct = (product: Product) => {
    setSelectedId(product.id);
    setEditor(structuredClone(product));
    setView("products");
  };

  const createProduct = () => {
    const product = blankProduct();
    setSelectedId(product.id);
    setEditor(product);
    setView("products");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `benchboard-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed.materials || !parsed.products || !parsed.platforms) throw new Error("Invalid backup");
        setData(parsed);
        if (parsed.products[0]) chooseProduct(parsed.products[0]);
      } catch {
        window.alert("That file does not look like a Benchboard backup.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const resetDemo = () => {
    if (!window.confirm("Replace your current local data with the starter workshop?")) return;
    const reset = structuredClone(starterData);
    setData(reset);
    chooseProduct(reset.products[0]);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("overview")} aria-label="Go to overview">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><strong>Benchboard</strong><small>Cost studio</small></span>
        </button>
        <nav aria-label="Main navigation">
          <p className="nav-eyebrow">Workshop</p>
          {nav.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => setView(item.id)}>
              <span className="nav-icon">{item.short}</span>
              <span>{item.label}</span>
              {item.id === "products" && <em>{data.products.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="save-state"><span className={saved ? "pulse" : ""} />{saved ? "Saved just now" : "Saved on this device"}</div>
          <button onClick={exportData}>Export backup</button>
          <button onClick={() => fileInput.current?.click()}>Import backup</button>
          <input ref={fileInput} type="file" accept=".json" hidden onChange={importData} />
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand">Benchboard</div>
          <label className="search">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the workshop…" />
          </label>
          <div className="top-actions">
            <span className="local-pill">● Local workspace</span>
            <button className="primary compact" onClick={createProduct}>＋ New product</button>
          </div>
        </header>

        <div className="mobile-nav">
          {nav.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.short}</button>
          ))}
        </div>

        {view === "overview" && (
          <Overview data={data} search={search} onProduct={chooseProduct} onNavigate={setView} onCreate={createProduct} />
        )}
        {view === "products" && (
          <ProductStudio
            data={data}
            editor={editor}
            setEditor={setEditor}
            costs={costs}
            suggestedPrice={suggestedPrice}
            selected={selected}
            onSelect={chooseProduct}
            onSave={saveProduct}
            onCreate={createProduct}
            onDelete={() => {
              if (!data.products.some((item) => item.id === editor.id) || !window.confirm(`Delete ${editor.name}?`)) return;
              const remaining = data.products.filter((item) => item.id !== editor.id);
              setData((current) => ({ ...current, products: remaining }));
              const next = remaining[0] || blankProduct();
              setSelectedId(next.id);
              setEditor(next);
            }}
          />
        )}
        {(view === "materials" || view === "labor" || view === "machines" || view === "shipping") && (
          <Library
            kind={view}
            items={data[view]}
            search={search}
            editing={editingItem}
            onEdit={setEditingItem}
            onSave={(item) => {
              setData((current) => ({
                ...current,
                [view]: current[view].some((existing) => existing.id === item.id)
                  ? current[view].map((existing) => (existing.id === item.id ? item : existing))
                  : [...current[view], item],
              }));
              setEditingItem(null);
            }}
            onDelete={(id) => setData((current) => ({ ...current, [view]: current[view].filter((item) => item.id !== id) }))}
          />
        )}
        {view === "platforms" && (
          <Platforms
            items={data.platforms}
            search={search}
            editing={editingPlatform}
            onEdit={setEditingPlatform}
            onSave={(platform) => {
              setData((current) => ({
                ...current,
                platforms: current.platforms.some((item) => item.id === platform.id)
                  ? current.platforms.map((item) => (item.id === platform.id ? platform : item))
                  : [...current.platforms, platform],
              }));
              setEditingPlatform(null);
            }}
            onDelete={(id) => setData((current) => ({ ...current, platforms: current.platforms.filter((item) => item.id !== id) }))}
          />
        )}
        <footer className="app-footer">
          <span>Benchboard stores data in this browser.</span>
          <button onClick={resetDemo}>Restore starter data</button>
        </footer>
      </section>
    </main>
  );
}

function Overview({ data, search, onProduct, onNavigate, onCreate }: {
  data: AppData;
  search: string;
  onProduct: (product: Product) => void;
  onNavigate: (view: View) => void;
  onCreate: () => void;
}) {
  const products = data.products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  const inventoryCount = data.materials.length + data.labor.length + data.machines.length + data.shipping.length;
  const featured = products[0] || data.products[0];
  const featuredCost = featured ? getProductCosts(featured, data) : null;
  const lowestMargin = data.products.reduce((lowest, product) => {
    const cost = getProductCosts(product, data).total;
    const margins = product.platformIds.map((id) => {
      const platform = data.platforms.find((item) => item.id === id);
      return platform ? platformResult(product.targetPrice, cost, platform).margin : 100;
    });
    return Math.min(lowest, ...margins);
  }, 100);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Good morning, maker</p>
          <h1>Your workshop at a glance</h1>
          <p>Build with confidence. Every board foot, shop hour, and selling fee is accounted for.</p>
        </div>
        <button className="primary" onClick={onCreate}>＋ Build a product</button>
      </div>

      <div className="metrics">
        <article><span className="metric-icon wood">▤</span><div><small>Active products</small><strong>{data.products.length}</strong><em>Ready to price</em></div></article>
        <article><span className="metric-icon green">↗</span><div><small>Lowest platform margin</small><strong>{Number.isFinite(lowestMargin) ? `${lowestMargin.toFixed(1)}%` : "—"}</strong><em>Across saved products</em></div></article>
        <article><span className="metric-icon gold">◇</span><div><small>Cost library</small><strong>{inventoryCount}</strong><em>Reusable cost items</em></div></article>
        <article><span className="metric-icon clay">▣</span><div><small>Selling platforms</small><strong>{data.platforms.length}</strong><em>Compared side by side</em></div></article>
      </div>

      <div className="overview-grid">
        <section className="panel product-list">
          <div className="panel-heading"><div><p className="eyebrow">Product costing</p><h2>Recent products</h2></div><button onClick={() => onNavigate("products")}>View all →</button></div>
          {products.length ? products.map((product) => {
            const productCosts = getProductCosts(product, data);
            const platform = data.platforms.find((item) => product.platformIds.includes(item.id));
            const result = platform ? platformResult(product.targetPrice, productCosts.total, platform) : null;
            return (
              <button className="product-row" key={product.id} onClick={() => onProduct(product)}>
                <span className="product-thumb"><i /><i /></span>
                <span className="product-info"><strong>{product.name}</strong><small>{product.sku || "No SKU"} · Updated {product.updated}</small></span>
                <span><small>COGS</small><strong>{formatMoney(productCosts.total)}</strong></span>
                <span><small>Price</small><strong>{formatMoney(product.targetPrice)}</strong></span>
                <span className={result && result.margin < 25 ? "margin warn" : "margin"}>{result ? `${result.margin.toFixed(0)}% margin` : "No platform"}</span>
                <b>›</b>
              </button>
            );
          }) : <div className="empty">No products match “{search}”.</div>}
        </section>

        <aside className="panel cost-snapshot">
          <div className="panel-heading"><div><p className="eyebrow">Live snapshot</p><h2>{featured?.name || "No product yet"}</h2></div></div>
          {featured && featuredCost ? (
            <>
              <div className="cost-total"><span>Total product cost</span><strong>{formatMoney(featuredCost.total)}</strong></div>
              <CostBar label="Raw materials" value={featuredCost.materials} total={featuredCost.total} color="var(--walnut)" />
              <CostBar label="Labor" value={featuredCost.labor} total={featuredCost.total} color="var(--sage)" />
              <CostBar label="Machine time" value={featuredCost.machines} total={featuredCost.total} color="var(--ochre)" />
              <CostBar label="Shipping materials" value={featuredCost.shipping} total={featuredCost.total} color="var(--clay)" />
              <button className="secondary full" onClick={() => onProduct(featured)}>Open cost sheet</button>
            </>
          ) : <div className="empty">Build your first product to see its cost story.</div>}
        </aside>
      </div>

      <section className="quick-library">
        <div className="section-title"><p className="eyebrow">Master costs</p><h2>Keep your numbers current</h2></div>
        <div className="library-cards">
          {([
            ["materials", "Raw materials", data.materials.length, "Lumber, sheet goods, finishes & hardware", "▤"],
            ["labor", "Labor types", data.labor.length, "Shop, finishing, design & admin rates", "⌁"],
            ["machines", "Machine time", data.machines.length, "Hourly operating costs by machine", "◎"],
            ["shipping", "Shipping supplies", data.shipping.length, "Boxes, protection, labels & inserts", "□"],
          ] as [View, string, number, string, string][]).map(([id, title, count, description, icon]) => (
            <button key={id} onClick={() => onNavigate(id)}>
              <span>{icon}</span><strong>{title}</strong><p>{description}</p><small>{count} cost items <b>→</b></small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total ? (value / total) * 100 : 0;
  return (
    <div className="cost-bar">
      <div><span>{label}</span><strong>{formatMoney(value)}</strong></div>
      <i><b style={{ width: `${percent}%`, background: color }} /></i>
      <small>{percent.toFixed(1)}% of total cost</small>
    </div>
  );
}

function ProductStudio({ data, editor, setEditor, costs, suggestedPrice, selected, onSelect, onSave, onCreate, onDelete }: {
  data: AppData;
  editor: Product;
  setEditor: React.Dispatch<React.SetStateAction<Product>>;
  costs: ReturnType<typeof getProductCosts>;
  suggestedPrice: number;
  selected?: Product;
  onSelect: (product: Product) => void;
  onSave: () => void;
  onCreate: () => void;
  onDelete: () => void;
}) {
  const price = editor.targetPrice || suggestedPrice;
  const markups = [35, 50, 60, 75, 100];
  const groups: { key: LibraryKey; title: string; note: string }[] = [
    { key: "materials", title: "Raw materials", note: "Boards, hardware & finish" },
    { key: "labor", title: "Labor", note: "People and production time" },
    { key: "machines", title: "Machine time", note: "Equipment operating time" },
    { key: "shipping", title: "Shipping materials", note: "Packaging used per order" },
  ];

  const updateLine = (group: LibraryKey, lineId: string, patch: Partial<RecipeLine>) => {
    setEditor((current) => ({ ...current, [group]: current[group].map((line) => line.id === lineId ? { ...line, ...patch } : line) }));
  };

  return (
    <div className="studio-layout">
      <aside className="product-rail">
        <div><p className="eyebrow">Your catalog</p><h2>Products</h2></div>
        <button className="secondary full" onClick={onCreate}>＋ New product</button>
        <div className="rail-list">
          {data.products.map((product) => (
            <button key={product.id} className={selected?.id === product.id ? "active" : ""} onClick={() => onSelect(product)}>
              <span><strong>{product.name}</strong><small>{product.sku || "No SKU"}</small></span><b>{formatMoney(product.targetPrice)}</b>
            </button>
          ))}
        </div>
      </aside>

      <div className="product-editor">
        <div className="editor-heading">
          <div>
            <p className="eyebrow">Product recipe</p>
            <input className="title-input" value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} aria-label="Product name" />
            <input className="sku-input" value={editor.sku} onChange={(event) => setEditor({ ...editor, sku: event.target.value })} placeholder="Add SKU" aria-label="Product SKU" />
          </div>
          <div className="editor-actions"><button className="danger-link" onClick={onDelete}>Delete</button><button className="primary" onClick={onSave}>Save product</button></div>
        </div>
        <textarea className="description" value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} placeholder="Describe the finished product…" />

        <div className="recipe-and-summary">
          <div className="recipe">
            {groups.map((group) => (
              <RecipeGroup
                key={group.key}
                title={group.title}
                note={group.note}
                items={data[group.key]}
                lines={editor[group.key]}
                onAdd={() => {
                  const firstUnused = data[group.key].find((item) => !editor[group.key].some((line) => line.itemId === item.id)) || data[group.key][0];
                  if (firstUnused) setEditor((current) => ({ ...current, [group.key]: [...current[group.key], { id: uid(), itemId: firstUnused.id, quantity: 1 }] }));
                }}
                onUpdate={(lineId, patch) => updateLine(group.key, lineId, patch)}
                onRemove={(lineId) => setEditor((current) => ({ ...current, [group.key]: current[group.key].filter((line) => line.id !== lineId) }))}
              />
            ))}

            <section className="recipe-card platform-picker">
              <div className="recipe-heading"><div><h3>Selling platforms</h3><p>Select every channel you want to compare</p></div></div>
              <div className="platform-checks">
                {data.platforms.map((platform) => (
                  <label key={platform.id}>
                    <input
                      type="checkbox"
                      checked={editor.platformIds.includes(platform.id)}
                      onChange={(event) => setEditor((current) => ({
                        ...current,
                        platformIds: event.target.checked ? [...current.platformIds, platform.id] : current.platformIds.filter((id) => id !== platform.id),
                      }))}
                    />
                    <span><strong>{platform.name}</strong><small>{platform.percent + platform.payment}% + {formatMoney(platform.fixed)}</small></span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="pricing-panel">
            <p className="eyebrow">Pricing studio</p>
            <h2>Know your number</h2>
            <div className="cost-breakdown">
              <span>Materials <b>{formatMoney(costs.materials)}</b></span>
              <span>Labor <b>{formatMoney(costs.labor)}</b></span>
              <span>Machine time <b>{formatMoney(costs.machines)}</b></span>
              <span>Shipping supplies <b>{formatMoney(costs.shipping)}</b></span>
              <strong>Total COGS <b>{formatMoney(costs.total)}</b></strong>
            </div>
            <label className="field-label">Choose a markup</label>
            <div className="markup-options">
              {markups.map((markup) => <button key={markup} className={editor.markup === markup ? "active" : ""} onClick={() => setEditor({ ...editor, markup })}>{markup}%</button>)}
            </div>
            <div className="suggested">
              <span>Suggested price <small>{editor.markup}% markup on COGS</small></span>
              <strong>{formatMoney(suggestedPrice)}</strong>
            </div>
            <label className="price-input"><span>Your selling price</span><div><b>$</b><input type="number" min="0" step=".5" value={editor.targetPrice || ""} onChange={(event) => setEditor({ ...editor, targetPrice: Number(event.target.value) })} placeholder={suggestedPrice.toFixed(2)} /></div></label>
            <p className="pricing-note">Platform fees are calculated from your selling price, then deducted with COGS to show take-home profit.</p>
          </aside>
        </div>

        <section className="platform-results">
          <div className="section-title"><p className="eyebrow">Channel comparison</p><h2>Profit by selling platform</h2><p>At a selling price of {formatMoney(price)}</p></div>
          <div className="result-grid">
            {editor.platformIds.map((id) => {
              const platform = data.platforms.find((item) => item.id === id);
              if (!platform) return null;
              const result = platformResult(price, costs.total, platform);
              return (
                <article key={id}>
                  <div className="result-title"><span>{platform.name.slice(0, 2).toUpperCase()}</span><strong>{platform.name}</strong></div>
                  <dl><div><dt>Selling price</dt><dd>{formatMoney(price)}</dd></div><div><dt>Platform fees</dt><dd>− {formatMoney(result.fees)}</dd></div><div><dt>Total COGS</dt><dd>− {formatMoney(costs.total)}</dd></div></dl>
                  <div className="profit"><span>Profit per sale<small>{result.margin.toFixed(1)}% margin</small></span><strong>{formatMoney(result.profit)}</strong></div>
                </article>
              );
            })}
            {!editor.platformIds.length && <div className="empty wide">Select at least one selling platform to compare fees and profit.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function RecipeGroup({ title, note, items, lines, onAdd, onUpdate, onRemove }: {
  title: string;
  note: string;
  items: CostItem[];
  lines: RecipeLine[];
  onAdd: () => void;
  onUpdate: (lineId: string, patch: Partial<RecipeLine>) => void;
  onRemove: (lineId: string) => void;
}) {
  const total = lineCost(lines, items);
  return (
    <section className="recipe-card">
      <div className="recipe-heading"><div><h3>{title}</h3><p>{note}</p></div><strong>{formatMoney(total)}</strong></div>
      {lines.map((line) => {
        const item = items.find((option) => option.id === line.itemId);
        return (
          <div className="recipe-line" key={line.id}>
            <select value={line.itemId} onChange={(event) => onUpdate(line.id, { itemId: event.target.value })}>
              {items.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
            <label><span>Qty</span><input type="number" min="0" step=".05" value={line.quantity} onChange={(event) => onUpdate(line.id, { quantity: Number(event.target.value) })} /></label>
            <span className="line-unit">{item?.unit || "unit"}</span>
            <strong>{formatMoney((item?.cost || 0) * line.quantity)}</strong>
            <button onClick={() => onRemove(line.id)} aria-label={`Remove ${item?.name || "line"}`}>×</button>
          </div>
        );
      })}
      <button className="add-line" onClick={onAdd} disabled={!items.length}>＋ Add {title.toLowerCase()}</button>
    </section>
  );
}

const libraryMeta: Record<LibraryKey, { title: string; singular: string; description: string; defaultCategory: string; defaultUnit: string }> = {
  materials: { title: "Raw materials", singular: "material", description: "Lumber, sheet goods, finishes, and hardware used in your builds.", defaultCategory: "Hardwood", defaultUnit: "board ft" },
  labor: { title: "Labor types", singular: "labor type", description: "Set a true hourly cost for every kind of work in your shop.", defaultCategory: "Production", defaultUnit: "hour" },
  machines: { title: "Machine time", singular: "machine", description: "Capture depreciation, power, maintenance, and consumables as an hourly rate.", defaultCategory: "Cutting", defaultUnit: "machine hr" },
  shipping: { title: "Shipping supplies", singular: "shipping item", description: "Boxes, cushioning, labels, tape, and inserts used to fulfill an order.", defaultCategory: "Packaging", defaultUnit: "each" },
};

function Library({ kind, items, search, editing, onEdit, onSave, onDelete }: {
  kind: LibraryKey;
  items: CostItem[];
  search: string;
  editing: CostItem | null;
  onEdit: (item: CostItem | null) => void;
  onSave: (item: CostItem) => void;
  onDelete: (id: string) => void;
}) {
  const meta = libraryMeta[kind];
  const filtered = items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  const [draft, setDraft] = useState<CostItem | null>(null);

  useEffect(() => setDraft(editing), [editing]);
  const beginNew = () => {
    const item = { id: uid(), name: "", category: meta.defaultCategory, unit: meta.defaultUnit, cost: 0, updated: today() };
    onEdit(item);
    setDraft(item);
  };

  return (
    <div className="page library-page">
      <div className="page-heading"><div><p className="eyebrow">Master cost library</p><h1>{meta.title}</h1><p>{meta.description}</p></div><button className="primary" onClick={beginNew}>＋ Add {meta.singular}</button></div>
      <section className="panel table-panel">
        <div className="table-tools"><span>{filtered.length} items</span><small>Update prices here and every product recipe recalculates automatically.</small></div>
        <div className="data-table">
          <div className="table-head"><span>Name</span><span>Category</span><span>Unit of measure</span><span>Cost per unit</span><span>Updated</span><span /></div>
          {filtered.map((item) => (
            <div className="table-row" key={item.id}>
              <strong>{item.name}</strong><span>{item.category}</span><span>{item.unit}</span><b>{formatMoney(item.cost)}</b><small>{item.updated}</small>
              <span className="row-actions"><button onClick={() => onEdit(item)}>Edit</button><button className="delete" onClick={() => window.confirm(`Delete ${item.name}?`) && onDelete(item.id)}>×</button></span>
            </div>
          ))}
          {!filtered.length && <div className="empty">No cost items match your search.</div>}
        </div>
      </section>
      {draft && (
        <ItemForm
          title={`${items.some((item) => item.id === draft.id) ? "Edit" : "Add"} ${meta.singular}`}
          item={draft}
          onChange={setDraft}
          onCancel={() => onEdit(null)}
          onSave={() => draft.name.trim() && onSave({ ...draft, name: draft.name.trim(), updated: today() })}
        />
      )}
    </div>
  );
}

function ItemForm({ title, item, onChange, onCancel, onSave }: {
  title: string;
  item: CostItem;
  onChange: (item: CostItem) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading"><div><p className="eyebrow">Cost library</p><h2>{title}</h2></div><button onClick={onCancel}>×</button></div>
        <label>Name<input autoFocus value={item.name} onChange={(event) => onChange({ ...item, name: event.target.value })} placeholder="e.g. Cherry lumber" /></label>
        <div className="field-grid"><label>Category<input value={item.category} onChange={(event) => onChange({ ...item, category: event.target.value })} /></label><label>Unit of measure<input value={item.unit} onChange={(event) => onChange({ ...item, unit: event.target.value })} placeholder="board ft, hour, each…" /></label></div>
        <label>Cost per unit<div className="money-field"><span>$</span><input type="number" min="0" step=".01" value={item.cost || ""} onChange={(event) => onChange({ ...item, cost: Number(event.target.value) })} /></div></label>
        <div className="modal-actions"><button className="secondary" onClick={onCancel}>Cancel</button><button className="primary" onClick={onSave}>Save cost item</button></div>
      </section>
    </div>
  );
}

function Platforms({ items, search, editing, onEdit, onSave, onDelete }: {
  items: Platform[];
  search: string;
  editing: Platform | null;
  onEdit: (item: Platform | null) => void;
  onSave: (item: Platform) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const [draft, setDraft] = useState<Platform | null>(null);
  useEffect(() => setDraft(editing), [editing]);
  const beginNew = () => {
    const platform = { id: uid(), name: "", percent: 0, fixed: 0, payment: 2.9 };
    onEdit(platform);
    setDraft(platform);
  };
  return (
    <div className="page library-page">
      <div className="page-heading"><div><p className="eyebrow">Sales channels</p><h1>Selling platforms</h1><p>Store listing, transaction, and payment fees for accurate take-home profit.</p></div><button className="primary" onClick={beginNew}>＋ Add platform</button></div>
      <div className="platform-library">
        {filtered.map((platform) => (
          <article key={platform.id}>
            <div className="platform-logo">{platform.name.slice(0, 2).toUpperCase()}</div>
            <div><h2>{platform.name}</h2><p>Total variable fee <strong>{platform.percent + platform.payment}%</strong></p></div>
            <dl><div><dt>Platform fee</dt><dd>{platform.percent}%</dd></div><div><dt>Payment processing</dt><dd>{platform.payment}%</dd></div><div><dt>Fixed fee per sale</dt><dd>{formatMoney(platform.fixed)}</dd></div></dl>
            <div className="card-actions"><button onClick={() => onEdit(platform)}>Edit fees</button><button onClick={() => window.confirm(`Delete ${platform.name}?`) && onDelete(platform.id)}>Delete</button></div>
          </article>
        ))}
      </div>
      {draft && (
        <PlatformForm item={draft} onChange={setDraft} onCancel={() => onEdit(null)} onSave={() => draft.name.trim() && onSave({ ...draft, name: draft.name.trim() })} />
      )}
    </div>
  );
}

function PlatformForm({ item, onChange, onCancel, onSave }: {
  item: Platform;
  onChange: (item: Platform) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const input = (key: "percent" | "payment" | "fixed", label: string, suffix: string) => (
    <label>{label}<div className="suffix-field"><input type="number" min="0" step=".01" value={item[key] || ""} onChange={(event) => onChange({ ...item, [key]: Number(event.target.value) })} /><span>{suffix}</span></div></label>
  );
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label="Selling platform">
        <div className="modal-heading"><div><p className="eyebrow">Sales channel</p><h2>{item.name ? `Edit ${item.name}` : "Add platform"}</h2></div><button onClick={onCancel}>×</button></div>
        <label>Platform name<input autoFocus value={item.name} onChange={(event) => onChange({ ...item, name: event.target.value })} placeholder="e.g. Etsy" /></label>
        <div className="field-grid">{input("percent", "Platform fee", "%")}{input("payment", "Payment processing", "%")}</div>
        {input("fixed", "Fixed fee per transaction", "$")}
        <div className="fee-preview">On a $100 sale, estimated fees are <strong>{formatMoney(100 * ((item.percent + item.payment) / 100) + item.fixed)}</strong></div>
        <div className="modal-actions"><button className="secondary" onClick={onCancel}>Cancel</button><button className="primary" onClick={onSave}>Save platform</button></div>
      </section>
    </div>
  );
}
