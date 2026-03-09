"use client";

import { useEffect } from "react";
import { driver } from "driver.js";

export default function OnboardingTour() {
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: "Próximo ›",
      prevBtnText: "‹ Voltar",
      doneBtnText: "Começar",
      popoverClass: "driverjs-theme-dark",
      steps: [
        {
          element: "#tour-welcome",
          popover: {
            title: "Bem-vindo ao Netuno!",
            description:
              "Vamos fazer um tour super rápido para te mostrar como preparar o seu painel.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#tour-upload",
          popover: {
            title: "A Mágica Acontece Aqui",
            description:
              "Você só precisa arrastar o PDF do seu histórico escolar aqui para dentro. Nossa IA vai ler tudo e montar a sua grade automaticamente.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#tour-skip",
          popover: {
            title: "Prefere fazer na mão?",
            description:
              "Se não tiver o PDF agora, não tem problema. Você pode pular essa etapa e adicionar as disciplinas manualmente depois.",
            side: "top",
            align: "center",
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  return null;
}
