import { FormData, Phase1Result, VisualRecommendation } from '@/types';

export interface DownloadData {
  inputData: FormData;
  phase1Result?: Phase1Result;
  selectedDetails: Map<string, VisualRecommendation>;
}


export const downloadAsTXT = (data: DownloadData) => {
  const visualTypeNames = {
    illustration: '삽화',
    photo: '사진',
    flowchart: '순서도',
    graph: '그래프',
    table: '도표'
  };

  let txtContent = '';
  
  txtContent += '='.repeat(60) + '\n';
  txtContent += '시각자료 분석 결과\n';
  txtContent += '='.repeat(60) + '\n\n';
  
  txtContent += `내보내기 일시: ${new Date().toLocaleString('ko-KR')}\n`;
  txtContent += `콘텐츠 세트 ID: ${data.inputData.contentSetId || '(미지정)'}\n\n`;
  
  txtContent += '■ 입력 정보\n';
  txtContent += '-'.repeat(30) + '\n';
  txtContent += `과목: ${data.inputData.subject}\n`;
  txtContent += `학년: ${data.inputData.grade || '(미지정)'}\n`;
  txtContent += `영역: ${data.inputData.area || '(미지정)'}\n`;
  txtContent += `주제: ${data.inputData.topic || '(미지정)'}\n`;
  txtContent += `핵심어: ${data.inputData.keywords || '(미지정)'}\n`;
  txtContent += `지문 유형: ${data.inputData.textType || '(미지정)'}\n`;
  txtContent += `콘텐츠 세트 ID: ${data.inputData.contentSetId || '(미지정)'}\n\n`;
  
  txtContent += '■ 지문 내용\n';
  txtContent += '-'.repeat(30) + '\n';
  txtContent += data.inputData.content + '\n\n';
  
  if (data.phase1Result) {
    txtContent += '■ 1차 분석 결과 (적합도)\n';
    txtContent += '-'.repeat(30) + '\n';
    Object.entries(data.phase1Result.visualTypeSuitability).forEach(([type, percent]) => {
      const typeName = visualTypeNames[type as keyof typeof visualTypeNames];
      txtContent += `${typeName}: ${percent}%\n`;
    });
    txtContent += '\n';
    
    txtContent += '■ 시각자료별 추천 이유\n';
    txtContent += '-'.repeat(30) + '\n';
    data.phase1Result.reasonSummary.forEach(reason => {
      const typeName = visualTypeNames[reason.type as keyof typeof visualTypeNames];
      txtContent += `[${typeName}] ${reason.reason}\n\n`;
    });
  }
  
  // 상세 분석 결과 - 5가지 시각자료 모두 표시 (데이터가 있는 것만 내용 채움)
  txtContent += '■ 상세 분석 결과\n';
  txtContent += '='.repeat(40) + '\n\n';
  
  Object.keys(visualTypeNames).forEach(type => {
    const typeName = visualTypeNames[type as keyof typeof visualTypeNames];
    const detail = data.selectedDetails.get(type);
    
    txtContent += `● ${typeName}\n`;
    txtContent += '-'.repeat(30) + '\n';
    
    if (detail) {
      txtContent += `적합도: ${detail.suitabilityPercent}%\n\n`;
      
      if (detail.reason) {
        txtContent += `▪ 추천 이유:\n${detail.reason}\n\n`;
      }
      
      if (detail.composition) {
        txtContent += `▪ 구성 방안:\n${detail.composition}\n\n`;
      }
      
      if (detail.implementation) {
        txtContent += `▪ 제작 고려사항:\n${detail.implementation}\n\n`;
      }
      
      if (detail.freeImageSources && detail.freeImageSources.length > 0) {
        txtContent += `▪ 저작권 프리 이미지 소스:\n`;
        detail.freeImageSources.forEach((source, index) => {
          txtContent += `  ${index + 1}. ${source.site}\n`;
          txtContent += `     검색 키워드: ${source.searchKeywords}\n`;
          txtContent += `     URL: ${source.url}\n`;
        });
        txtContent += '\n';
      }
      
      if (detail.aiPrompt) {
        txtContent += `▪ AI 이미지 생성 프롬프트:\n${detail.aiPrompt}\n\n`;
      } else if (detail.imageGenerationPrompt) {
        txtContent += `▪ AI 이미지 생성 프롬프트:\n`;
        txtContent += `  • 목적: ${detail.imageGenerationPrompt.purpose}\n`;
        txtContent += `  • 생성 조건: ${detail.imageGenerationPrompt.conditions}\n`;
        txtContent += `  • 구성 방안: ${detail.imageGenerationPrompt.composition}\n`;
        txtContent += `  • 주의사항: ${detail.imageGenerationPrompt.precautions}\n\n`;
      }
    } else {
      txtContent += '(상세 분석 미실시)\n\n';
    }
    
    txtContent += '\n';
  });
  
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const fileName = `${data.inputData.contentSetId || 'unknown'}_prompt.txt`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};