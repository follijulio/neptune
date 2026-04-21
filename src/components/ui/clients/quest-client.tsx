"use client";

import {
  BossTab,
  QuestionDialog,
  TabSwitcher,
  TrainingTab,
} from "./quest/quest-view";
import { useQuestController } from "./quest/use-quest-controller";

export default function QuestsClient() {
  const {
    activeTab,
    setActiveTab,
    documentId,
    deletingDocId,
    history,
    isLoadingHistory,
    isGenerating,
    questions,
    selectedQuestion,
    answerText,
    isEvaluating,
    feedback,
    isInvokingBoss,
    bossQuestion,
    questError,
    bossError,
    setQuestError,
    setBossError,
    setAnswerText,
    setFeedback,
    loadHistoricalDocument,
    resetToNewDocument,
    openQuestion,
    closeQuestionDialog,
    handleUploadComplete,
    handleDeleteDocument,
    handleGenerateQuestions,
    handleInvokeBoss,
    handleAnswerSubmit,
  } = useQuestController();

  return (
    <section className="px-4 sm:px-0">
      <div className="h-full w-full">
        <header className="flex flex-col gap-4 border-b border-[#1A1A1A] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Quests</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Transforme materiais brutos em conhecimento sólido.
            </p>
          </div>
          <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
        </header>

        <div className="mt-8">
          {isLoadingHistory && (
            <p className="mb-4 text-sm text-zinc-500">
              Carregando histórico...
            </p>
          )}
          {activeTab === "training" ? (
            <TrainingTab
              documentId={documentId}
              questions={questions}
              history={history}
              isGenerating={isGenerating}
              deletingDocId={deletingDocId}
              questError={questError}
              onClearError={() => setQuestError(null)}
              onSelectDocument={loadHistoricalDocument}
              onNewDocument={resetToNewDocument}
              onDeleteDocument={handleDeleteDocument}
              onUploadComplete={handleUploadComplete}
              onGenerateQuestions={handleGenerateQuestions}
              onOpenQuestion={openQuestion}
            />
          ) : (
            <BossTab
              bossQuestion={bossQuestion}
              bossError={bossError}
              isInvokingBoss={isInvokingBoss}
              onClearError={() => setBossError(null)}
              onInvokeBoss={handleInvokeBoss}
              onOpenQuestion={openQuestion}
            />
          )}
        </div>

        <QuestionDialog
          selectedQuestion={selectedQuestion}
          activeTab={activeTab}
          answerText={answerText}
          isEvaluating={isEvaluating}
          feedback={feedback}
          onClose={closeQuestionDialog}
          onAnswerChange={setAnswerText}
          onSubmit={handleAnswerSubmit}
          onRetry={() => setFeedback(null)}
        />
      </div>
    </section>
  );
}
