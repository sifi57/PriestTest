import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type TestResult = {
  characterName: string;
  biography: string;
  analysis: string;
};

export async function evaluateTest(answers: Record<number, string[]>): Promise<TestResult> {
  const prompt = `
你是一个精通Priest小说人物心理学和性格分析的专家。
用户刚刚完成了一份包含15道题的性格测试。请根据用户的回答，从以下42个人物中，匹配最符合用户性格底色的一位：
施无端、白离、寇桐、黄瑾琛、卡洛斯、阿尔多、长安、华沂、周子舒、温客行、赵云澜、沈巍、魏谦、魏之远、褚桓、南山、程潜、严争鸣、顾昀、长庚、徐西临、窦寻、周翡、谢允、费渡、骆闻舟、林静恒、陆必行、宣玑、盛灵渊、顾晏、燕绥之、林晓路、江哲、傅落、杨宁、奚平、乌鸦、加百列、唐果、缪妙、林水仙。

用户的回答如下（题号对应选项）：
${JSON.stringify(answers, null, 2)}

请输出JSON格式的结果，包含：
1. characterName: 匹配的人物名字
2. biography: 200字左右的人物生平简介
3. analysis: 600字左右的深度解析，结合用户的测试选项，分析为什么该人物与用户契合，涵盖命运观、防御机制、处世哲学、情感逻辑和审美意向。
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characterName: { type: Type.STRING },
          biography: { type: Type.STRING },
          analysis: { type: Type.STRING },
        },
        required: ["characterName", "biography", "analysis"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate result");
  }

  return JSON.parse(response.text) as TestResult;
}
