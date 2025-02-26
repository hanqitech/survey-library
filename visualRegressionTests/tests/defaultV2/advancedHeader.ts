import { Selector, ClientFunction } from "testcafe";
import { url, frameworks, initSurvey, url_test, takeElementScreenshot, wrapVisualTest } from "../../helper";

const title = "Advanced header screenshot";

fixture`${title}`.page`${url}`;

const applyTheme = ClientFunction(theme => {
  (<any>window).Survey.StylesManager.applyTheme(theme);
});

const theme = "defaultV2";

frameworks.forEach(framework => {
  fixture`${framework} ${title} ${theme}`
    .page`${url_test}${theme}/${framework}`
    .beforeEach(async t => {
      await applyTheme(theme);
    });

  test("Check survey advanced header inherit width from survey", async (t) => {
    await wrapVisualTest(t, async (t, comparer) => {
      await t.resizeWindow(1200, 1000);
      await initSurvey(framework, {
        title: "Survey Title",
        description: "Survey description",
        logo: "https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg",
        "widthMode": "static",
        "width": "600",
        headerView: "advanced",
        questions: [
          {
            type: "text",
            title: "Question title",
            name: "q1"
          }
        ]
      });
      await ClientFunction(() => {
        (<any>window).survey.applyTheme({
          "header": {
            height: "500px",
          }
        });
      })();
      await takeElementScreenshot("survey-advanced-header-width-by-survey.png", Selector(".sd-root-modern"), t, comparer);
    });
  });
  test("Check survey advanced header with overlap", async (t) => {
    await wrapVisualTest(t, async (t, comparer) => {
      await t.resizeWindow(1200, 1000);
      await initSurvey(framework, {
        title: "Survey Title",
        description: "Survey description",
        logo: "https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg",
        "widthMode": "static",
        "width": "600",
        headerView: "advanced",
        questions: [
          {
            type: "text",
            title: "Question title",
            name: "q1"
          }
        ]
      });
      await ClientFunction(() => {
        (<any>window).survey.applyTheme({
          "header": {
            height: "500px",
            "overlapEnabled": true,
          },
          "cssVariables": {
            "--sjs-header-backcolor": "rgba(25, 179, 148, 1)"
          }
        });
      })();
      await takeElementScreenshot("survey-advanced-header-with-overlap.png", Selector(".sd-root-modern"), t, comparer);
    });
  });
});