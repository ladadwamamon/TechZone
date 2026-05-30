import { useState } from "react";
import {
  useAdminListProducts,
  getAdminListProductsQueryKey,
  useAdminDeleteProduct,
  useListCategories,
  useListBrands,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  type AdminProduct,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MediaPicker } from "@/components/MediaPicker";

interface SpecRow {
  labelAr: string;
  value: string;
}
interface VariantRow {
  id: string;
  label: string;
  value: string;
  price: string;
  inStock: boolean;
}

interface ProductFormState {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  price: string;
  originalPrice: string;
  discountPercent: string;
  categorySlug: string;
  brandSlug: string;
  image: string;
  image2: string;
  stock: string;
  rating: string;
  reviewCount: string;
  warranty: string;
  descriptionAr: string;
  isNew: boolean;
  isBestSeller: boolean;
  isExclusive: boolean;
  isFlashDeal: boolean;
  isFeatured: boolean;
  specs: SpecRow[];
  variants: VariantRow[];
  badges: string[];
}

const EMPTY_FORM: ProductFormState = {
  nameAr: "",
  nameEn: "",
  slug: "",
  sku: "",
  price: "",
  originalPrice: "",
  discountPercent: "",
  categorySlug: "",
  brandSlug: "",
  image: "",
  image2: "",
  stock: "0",
  rating: "0",
  reviewCount: "0",
  warranty: "",
  descriptionAr: "",
  isNew: false,
  isBestSeller: false,
  isExclusive: false,
  isFlashDeal: false,
  isFeatured: false,
  specs: [],
  variants: [],
  badges: [],
};

const numOrUndef = (v: string): number | undefined => {
  const t = v.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isNaN(n) ? undefined : n;
};

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [badgeInput, setBadgeInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const limit = 10;
  const productsParams = {
    page,
    limit,
    search: search || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    brand: brandFilter !== "all" ? brandFilter : undefined,
  };
  const { data: productsData, isLoading } = useAdminListProducts(productsParams, {
    query: { queryKey: getAdminListProductsQueryKey(productsParams) },
  });

  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const set = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const totalPages = productsData ? Math.max(1, Math.ceil(productsData.total / limit)) : 1;

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors([]);
    setBadgeInput("");
    setIsDialogOpen(true);
  };

  const handleEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setErrors([]);
    setBadgeInput("");
    setForm({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: p.slug,
      sku: p.sku ?? "",
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
      discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
      categorySlug: p.categorySlug,
      brandSlug: p.brandSlug,
      image: p.image,
      image2: p.image2 ?? "",
      stock: String(p.stock),
      rating: String(p.rating),
      reviewCount: String(p.reviewCount),
      warranty: p.warranty ?? "",
      descriptionAr: p.descriptionAr ?? "",
      isNew: !!p.isNew,
      isBestSeller: !!p.isBestSeller,
      isExclusive: !!p.isExclusive,
      isFlashDeal: !!p.isFlashDeal,
      isFeatured: !!p.isFeatured,
      specs: (p.specs ?? []).map((s) => ({ labelAr: s.labelAr, value: s.value })),
      variants: (p.variants ?? []).map((v) => ({
        id: v.id,
        label: v.label,
        value: v.value,
        price: String(v.price),
        inStock: v.inStock,
      })),
      badges: p.badges ?? [],
    });
    setIsDialogOpen(true);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.nameAr.trim()) errs.push("الاسم بالعربي مطلوب");
    if (!form.nameEn.trim()) errs.push("الاسم بالإنجليزي مطلوب");
    if (!form.slug.trim()) errs.push("الرابط (Slug) مطلوب");
    if (numOrUndef(form.price) === undefined) errs.push("السعر مطلوب ويجب أن يكون رقماً");
    if (!form.categorySlug) errs.push("الفئة مطلوبة");
    if (!form.brandSlug) errs.push("العلامة التجارية مطلوبة");
    if (!form.image.trim()) errs.push("الصورة الرئيسية مطلوبة");
    return errs;
  };

  const buildPayload = () => ({
    nameAr: form.nameAr.trim(),
    nameEn: form.nameEn.trim(),
    slug: form.slug.trim(),
    sku: form.sku.trim() || null,
    price: numOrUndef(form.price) ?? 0,
    originalPrice: numOrUndef(form.originalPrice) ?? null,
    discountPercent: numOrUndef(form.discountPercent) ?? null,
    categorySlug: form.categorySlug,
    brandSlug: form.brandSlug,
    image: form.image.trim(),
    image2: form.image2.trim() || null,
    stock: numOrUndef(form.stock) ?? 0,
    rating: numOrUndef(form.rating) ?? 0,
    reviewCount: numOrUndef(form.reviewCount) ?? 0,
    warranty: form.warranty.trim() || null,
    descriptionAr: form.descriptionAr.trim() || null,
    isNew: form.isNew,
    isBestSeller: form.isBestSeller,
    isExclusive: form.isExclusive,
    isFlashDeal: form.isFlashDeal,
    isFeatured: form.isFeatured,
    specs: form.specs.filter((s) => s.labelAr.trim() && s.value.trim()),
    variants: form.variants
      .filter((v) => v.label.trim())
      .map((v) => ({
        id: v.id || `var-${Math.random().toString(36).slice(2, 8)}`,
        label: v.label.trim(),
        value: v.value.trim(),
        price: numOrUndef(v.price) ?? 0,
        inStock: v.inStock,
      })),
    badges: form.badges,
  });

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    const payload = buildPayload();
    const onSuccess = (msg: string) => {
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      setIsDialogOpen(false);
    };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => onSuccess("تم تحديث المنتج بنجاح"),
          onError: () => toast({ title: "فشل تحديث المنتج", variant: "destructive" }),
        },
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => onSuccess("تمت إضافة المنتج بنجاح"),
          onError: () => toast({ title: "فشل إضافة المنتج", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        },
        onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
      },
    );
  };

  const addBadge = () => {
    const b = badgeInput.trim();
    if (b && !form.badges.includes(b)) set("badges", [...form.badges, b]);
    setBadgeInput("");
  };

  const flagFields: Array<{ key: keyof ProductFormState; label: string }> = [
    { key: "isNew", label: "جديد" },
    { key: "isBestSeller", label: "الأكثر مبيعاً" },
    { key: "isExclusive", label: "حصري" },
    { key: "isFlashDeal", label: "عرض خاطف" },
    { key: "isFeatured", label: "مميز" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Package className="w-8 h-8" />
          المنتجات
        </h1>
        <Button onClick={handleOpenCreate} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pr-9 bg-background/50 border-primary/20"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
          dir="rtl"
        >
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="كل الفئات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={brandFilter}
          onValueChange={(v) => {
            setBrandFilter(v);
            setPage(1);
          }}
          dir="rtl"
        >
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="كل العلامات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العلامات</SelectItem>
            {brands?.map((b) => (
              <SelectItem key={b.id} value={b.slug}>
                {b.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[760px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>

          {errors.length > 0 && (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive space-y-1">
              {errors.map((e, i) => (
                <div key={i}>• {e}</div>
              ))}
            </div>
          )}

          <Tabs defaultValue="basic" dir="rtl">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="basic">أساسي</TabsTrigger>
              <TabsTrigger value="media">الصور</TabsTrigger>
              <TabsTrigger value="specs">المواصفات</TabsTrigger>
              <TabsTrigger value="variants">الخيارات</TabsTrigger>
              <TabsTrigger value="flags">الشارات والحالة</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="الاسم بالعربي">
                  <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
                </Field>
                <Field label="الاسم بالإنجليزي">
                  <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" />
                </Field>
                <Field label="الرابط (Slug)">
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} dir="ltr" />
                </Field>
                <Field label="رمز المنتج (SKU)">
                  <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} dir="ltr" />
                </Field>
                <Field label="السعر">
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label="السعر الأصلي (قبل الخصم)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => set("originalPrice", e.target.value)}
                  />
                </Field>
                <Field label="نسبة الخصم %">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.discountPercent}
                    onChange={(e) => set("discountPercent", e.target.value)}
                  />
                </Field>
                <Field label="المخزون">
                  <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </Field>
                <Field label="الفئة">
                  <Select value={form.categorySlug} onValueChange={(v) => set("categorySlug", v)} dir="rtl">
                    <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          {c.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="العلامة التجارية">
                  <Select value={form.brandSlug} onValueChange={(v) => set("brandSlug", v)} dir="rtl">
                    <SelectTrigger><SelectValue placeholder="اختر العلامة" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map((b) => (
                        <SelectItem key={b.id} value={b.slug}>
                          {b.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="الضمان">
                  <Input value={form.warranty} onChange={(e) => set("warranty", e.target.value)} placeholder="سنة واحدة" />
                </Field>
                <Field label="التقييم (0-5)">
                  <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
                </Field>
              </div>
              <Field label="الوصف بالعربي">
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => set("descriptionAr", e.target.value)}
                  className="min-h-24"
                />
              </Field>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Field label="الصورة الرئيسية">
                <MediaPicker value={form.image} onChange={(url) => set("image", url)} />
              </Field>
              <Field label="الصورة الثانية (اختياري)">
                <MediaPicker value={form.image2} onChange={(url) => set("image2", url)} />
              </Field>
            </TabsContent>

            <TabsContent value="specs" className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set("specs", [...form.specs, { labelAr: "", value: "" }])}
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" /> إضافة مواصفة
                </Button>
              </div>
              {form.specs.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">لا توجد مواصفات</div>
              ) : (
                form.specs.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="الخاصية (مثال: المعالج)"
                      value={s.labelAr}
                      onChange={(e) =>
                        set(
                          "specs",
                          form.specs.map((x, idx) => (idx === i ? { ...x, labelAr: e.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="القيمة"
                      value={s.value}
                      onChange={(e) =>
                        set(
                          "specs",
                          form.specs.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => set("specs", form.specs.filter((_, idx) => idx !== i))}
                      className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="variants" className="space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    set("variants", [
                      ...form.variants,
                      { id: "", label: "", value: "", price: "", inStock: true },
                    ])
                  }
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" /> إضافة خيار
                </Button>
              </div>
              {form.variants.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">لا توجد خيارات (مثل اللون أو الحجم)</div>
              ) : (
                form.variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center">
                    <Input
                      placeholder="الاسم (لون)"
                      value={v.label}
                      onChange={(e) =>
                        set("variants", form.variants.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                      }
                    />
                    <Input
                      placeholder="القيمة (أسود)"
                      value={v.value}
                      onChange={(e) =>
                        set("variants", form.variants.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={v.price}
                      onChange={(e) =>
                        set("variants", form.variants.map((x, idx) => (idx === i ? { ...x, price: e.target.value } : x)))
                      }
                    />
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <Checkbox
                        checked={v.inStock}
                        onCheckedChange={(c) =>
                          set("variants", form.variants.map((x, idx) => (idx === i ? { ...x, inStock: !!c } : x)))
                        }
                      />
                      متوفر
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => set("variants", form.variants.filter((_, idx) => idx !== i))}
                      className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="flags" className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {flagFields.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 rounded border border-primary/10 p-2 bg-background/40">
                    <Checkbox
                      checked={form[f.key] as boolean}
                      onCheckedChange={(c) => set(f.key, !!c as ProductFormState[typeof f.key])}
                    />
                    <span className="text-sm">{f.label}</span>
                  </label>
                ))}
              </div>
              <Field label="الشارات (Badges)">
                <div className="flex gap-2">
                  <Input
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBadge();
                      }
                    }}
                    placeholder="أضف شارة واضغط Enter"
                  />
                  <Button type="button" variant="outline" onClick={addBadge} className="shrink-0">
                    إضافة
                  </Button>
                </div>
                {form.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.badges.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 rounded px-2 py-0.5 text-xs"
                      >
                        {b}
                        <button
                          type="button"
                          onClick={() => set("badges", form.badges.filter((_, idx) => idx !== i))}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="glow-hover"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-primary/20" />
              ))}
            </div>
          ) : productsData?.products && productsData.products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المخزون</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.products.map((product) => (
                    <TableRow key={product.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.nameAr}
                            className="w-10 h-10 object-cover rounded bg-background/50 border border-primary/20"
                          />
                          <div>
                            <div className="font-bold">{product.nameAr}</div>
                            <div className="text-xs text-muted-foreground" dir="ltr">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.categorySlug}</TableCell>
                      <TableCell className="font-mono">{product.price} ريال</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            product.stock > 0 ? "bg-lime/10 text-lime" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <Package className="w-16 h-16 opacity-20" />
              <p>لا توجد منتجات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {productsData && productsData.total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground font-mono">
            صفحة {page} من {totalPages} ({productsData.total} منتج)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
