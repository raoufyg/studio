'use server';
/**
 * @fileOverview Generates a poem based on the content of an image.
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
  style: z.string().describe('The style of poem to generate.'),
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
      style: z.string().describe('The style of poem to generate.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `أنت شاعر عربي مشهور يكتب قصائد بناءً على الصور. سيوفر المستخدم صورة، وستكتب قصيدة باللغة العربية بناءً على الصورة. يجب أن تكون القصيدة على غرار: {{{style}}}. تأكد من أن القصيدة تعكس جوهر الصورة وتثير المشاعر المناسبة.\n\nImage: {{media url=photoDataUri}}`,
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
