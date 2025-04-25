"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePoemFromImage } from "@/ai/flows/generate-poem-from-image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poemStyle, setPoemStyle] = useState<string>("Romantic");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

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
        title: "Please upload an image first.",
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
      console.error("Poem generation failed:", error);
      toast({
        title: "Poem generation failed.",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">PhotoPoet</h1>
      <Card className="w-full max-w-md space-y-4 p-4">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Get a poem generated from your image.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="mb-2"
          />
          {image ? (
            <img src={image} alt="Uploaded" className="rounded-md object-cover w-full h-48" />
          ) : (
            <div className="flex items-center justify-center w-full h-48 rounded-md bg-secondary">
              {loading ? (
                <Skeleton className="w-32 h-8" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
          )}
          <Textarea
            placeholder="Enter Poem Style"
            value={poemStyle}
            onChange={(e) => setPoemStyle(e.target.value)}
            disabled={loading}
          />
          <Button onClick={generatePoem} disabled={loading} className="w-full bg-warm-coral hover:bg-coral-600 text-white">
            {loading ? "Generating..." : "Generate Poem"}
          </Button>
          {poem && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Generated Poem</h2>
              <Card className="shadow-md rounded-md">
                <CardContent>
                  <p className="text-gray-800">{poem}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
