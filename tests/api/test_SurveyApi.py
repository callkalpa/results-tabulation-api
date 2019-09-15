from flask import Response

from orm.entities import Survey
from orm.entities.Survey import Question, Answer


class TestSurvey:
    def test_get_all(self, test_client):
        survey_name = "Test Survey One"
        Survey.create(survey_name=survey_name)

        response: Response = test_client.get("/survey")

        assert response.status_code == 200
        json_response = response.get_json()
        assert len(json_response) >= 2

        for key in ["surveyId", "surveyName"]:
            assert key in json_response[0].keys()

        assert len([x for x in json_response if x.get("surveyName") == survey_name]) > 0

    def test_get_by_id(self, test_client):
        survey = Survey.create(survey_name="Test Survey Two")
        question_1 = Question.create(question_text="Test Question 1")
        question_2 = Question.create(question_text="Test Question 2")
        answer_1 = Answer.create(answer_text="Test Answer 1")
        answer_2 = Answer.create(answer_text="Test Answer 2")
        answer_3 = Answer.create(answer_text="Test Answer 3")

        question_1.add_answer(answer_1).add_answer(answer_2).add_answer(answer_3)
        question_2.add_answer(answer_1).add_answer(answer_3)

        survey.add_question(question_1).add_question(question_2)

        response: Response = test_client.get(f"/survey/{survey.surveyId}")

        assert response.status_code == 200

        survey_json_response = response.get_json()
        for key in ["surveyId", "surveyName", "questions"]:
            assert key in survey_json_response.keys()
            assert survey_json_response.get(key) != "" or len(survey_json_response.get(key)) > 0

        questions_json_response = survey_json_response.get("questions")
        assert len(questions_json_response) == 2
        for key in ["questionId", "questionText", "answers"]:
            assert key in questions_json_response[0].keys()
            assert questions_json_response[0].get(key) != "" or len(questions_json_response[0].get(key)) > 0

        # answers for question 2
        answers_json_response = \
        [x for x in questions_json_response if x.get("questionText") == question_2.questionText][0].get("answers")
        assert len(answers_json_response) == 2
        for key in ["answerId", "answerText"]:
            assert key in answers_json_response[0].keys()
            assert answers_json_response[0].get(key) != "" or len(answers_json_response[0].get(key)) > 0
