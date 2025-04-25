"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePoemFromImage } from "@/ai/flows/generate-poem-from-image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";

// Dummy data for Arabic poems (replace with actual data source)
const poemStyles = [
  "غزل",
  "مدح",
  "رثاء",
  "هجاء",
  "وصف",
  "حكمة",
  "تصوف",
];

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poemStyle, setPoemStyle] = useState<string>(poemStyles[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const generatePoem = async () => {
    if (!image) {
      toast({
        title: "الرجاء تحميل صورة أولاً.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generatePoemFromImage({
        photoDataUri: image,
        style: poemStyle,
      });
      setPoem(result.poem);
    } catch (error: any) {
      console.error("فشل إنشاء القصيدة:", error);
      toast({
        title: "فشل إنشاء القصيدة.",
        description: error.message || "حدث خطأ ما.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-foreground">شاعر الصورة</h1>
      <Card className="w-full max-w-md space-y-4 p-4 bg-card text-foreground shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">تحميل الصورة</CardTitle>
          <CardDescription className="text-muted-foreground">احصل على قصيدة مستوحاة من صورتك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="mb-2 rounded-md"
          />
          {image ? (
            <img src={image} alt="تم التحميل" className="rounded-md object-cover w-full h-48" />
          ) : (
            <div className="flex items-center justify-center w-full h-48 rounded-md bg-secondary">
              {loading ? (
                <Skeleton className="w-32 h-8" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
          )}
          <select
            value={poemStyle}
            onChange={(e) => setPoemStyle(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {poemStyles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
          <Button onClick={generatePoem} disabled={loading} className="w-full bg-accent hover:bg-accent-600 text-accent-foreground rounded-md">
            {loading ? "جاري الإنشاء..." : "إنشاء قصيدة"}
          </Button>
          {poem && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">القصيدة التي تم إنشاؤها</h2>
              <Card className="shadow-md rounded-md bg-card text-foreground">
                <CardContent>
                  <p className="text-foreground" style={{ whiteSpace: 'pre-line', textAlign: 'right' }}>{poem}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
