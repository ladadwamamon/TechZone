import { useState, useEffect } from "react";
import { 
  useAdminGetSettings, 
  getAdminGetSettingsQueryKey,
  useAdminUpdateSettings
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const { data: settings, isLoading } = useAdminGetSettings({
    query: { queryKey: getAdminGetSettingsQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useAdminUpdateSettings();

  const [localSettings, setLocalSettings] = useState<Array<{key: string, value: string}>>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (settings) {
      setLocalSettings(
        Object.entries(settings).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      );
    }
  }, [settings]);

  const handleSave = () => {
    const dataObj: Record<string, string> = {};
    localSettings.forEach(s => {
      if (s.key.trim() !== "") {
        dataObj[s.key] = s.value;
      }
    });

    updateMutation.mutate({ data: dataObj }, {
      onSuccess: () => {
        toast({ title: "تم حفظ الإعدادات بنجاح" });
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "فشل حفظ الإعدادات", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    if (localSettings.some(s => s.key === newKey.trim())) {
      toast({ title: "هذا المفتاح موجود بالفعل", variant: "destructive" });
      return;
    }
    setLocalSettings([...localSettings, { key: newKey.trim(), value: newValue }]);
    setNewKey("");
    setNewValue("");
  };

  const handleRemove = (keyToRemove: string) => {
    setLocalSettings(localSettings.filter(s => s.key !== keyToRemove));
  };

  const handleChange = (index: number, val: string) => {
    const newArr = [...localSettings];
    newArr[index].value = val;
    setLocalSettings(newArr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          إعدادات النظام
        </h1>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="glow-hover clip-corner-sm gap-2">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <Card className="glass-panel border-primary/20 hud-frame max-w-4xl">
        <CardHeader>
          <CardTitle>متغيرات النظام</CardTitle>
          <CardDescription>إعدادات عامة لتكوين المتجر وتطبيقات الطرف الثالث</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full bg-primary/20" />)}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {localSettings.map((setting, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input 
                      value={setting.key} 
                      disabled 
                      className="font-mono bg-background/30 w-1/3 text-muted-foreground" 
                      dir="ltr" 
                    />
                    <Input 
                      value={setting.value} 
                      onChange={(e) => handleChange(i, e.target.value)} 
                      className="font-mono flex-1 bg-background/50" 
                      dir="ltr"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemove(setting.key)} 
                      className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {localSettings.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">لا توجد إعدادات</div>
                )}
              </div>

              <div className="pt-6 border-t border-primary/20">
                <h3 className="text-sm font-bold mb-4">إضافة متغير جديد</h3>
                <div className="flex gap-2 items-end">
                  <div className="w-1/3 space-y-1">
                    <label className="text-xs text-muted-foreground">المفتاح (Key)</label>
                    <Input 
                      value={newKey} 
                      onChange={(e) => setNewKey(e.target.value)} 
                      placeholder="e.g. STORE_NAME" 
                      className="font-mono" 
                      dir="ltr"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">القيمة (Value)</label>
                    <Input 
                      value={newValue} 
                      onChange={(e) => setNewValue(e.target.value)} 
                      placeholder="Value" 
                      className="font-mono" 
                      dir="ltr"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                      }}
                    />
                  </div>
                  <Button onClick={handleAdd} variant="outline" className="shrink-0 gap-2 border-primary/50 text-primary hover:bg-primary/10">
                    <Plus className="h-4 w-4" />
                    إضافة
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
