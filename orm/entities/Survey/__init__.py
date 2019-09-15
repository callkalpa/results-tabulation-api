from sqlalchemy.orm import relationship

from app import db
from orm.entities.Survey.Question import QuestionModel
from util import get_paginated_query


class SurveyModel(db.Model):
    __tablename__ = 'survey'
    surveyId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    surveyName = db.Column(db.String(100), nullable=False)
    questions = relationship(QuestionModel, secondary="survey_question")

    def add_question(self, question: QuestionModel):
        self.questions.append(question)

    
class SurveyQuestionModel(db.Model):
    __tablename__ = "survey_question"
    surveyId = db.Column(db.Integer, db.ForeignKey("survey.surveyId"), primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey("question.questionId"), primary_key=True)


Model = SurveyModel


def get_all():
    query = Model.query
    query = query.order_by(Model.surveyId)
    result = get_paginated_query(query).all()
    return result


def get_by_id(survey_id):
    result = Model.query.filter(
        Model.surveyId == survey_id
    ).one_or_none()

    return result


def create(survey_name):
    result = Model(surveyName=survey_name)
    db.session.add(result)
    db.session.flush()

    return result
