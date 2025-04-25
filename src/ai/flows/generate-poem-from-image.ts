'use server';
/**
 * @fileOverview Generates a poem based on the content of an image, drawing inspiration from a dataset of Arabic poetry.
 *
 * - generatePoemFromImage - A function that generates a poem from an image.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GeneratePoemFromImageOutput - The return type for the GeneratePoemFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z.string().describe('The style of poem to generate (e.g., غزل, مدح, رثاء).'),
});

export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GeneratePoemFromImageOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});

export type GeneratePoemFromImageOutput = z.infer<typeof GeneratePoemFromImageOutputSchema>;

export async function generatePoemFromImage(input: GeneratePoemFromImageInput): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      style: z.string().describe('The style of poem to generate (e.g., غزل, مدح, رثاء).'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `أنت مُتخصّص في الشعر العربي، ولديك معرفة واسعة بالأنماط الشعرية المختلفة مثل الغزل، المدح، والرثاء. قم بإنشاء قصيدة باللغة العربية الفصحى بناءً على الصورة والنمط المُختار. يجب أن تعكس القصيدة جوهر الصورة وأسلوب الشعر المطلوب، مع الالتزام بقواعد الشعر العربي التقليدية من حيث الوزن والقافية. حافظ على شكل القصيدة الأصلي بحيث تكتب على شكل أبيات.
  
  الصورة: {{media url=photoDataUri}}
  نمط الشعر: {{$style}}
  
  يجب أن تكون القصيدة مُعبّرة ومناسبة للصورة، وأن تستخدم اللغة العربية بطريقة جميلة وبليغة.`,
});

const generatePoemFromImageFlow = ai.defineFlow<
  typeof GeneratePoemFromImageInputSchema,
  typeof GeneratePoemFromImageOutputSchema
>({
  name: 'generatePoemFromImageFlow',
  inputSchema: GeneratePoemFromImageInputSchema,
  outputSchema: GeneratePoemFromImageOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
