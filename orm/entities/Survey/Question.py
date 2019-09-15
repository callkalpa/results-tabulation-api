from sqlalchemy.orm import relationship

from app import db
from orm.entities.Survey.Answer import AnswerModel


class QuestionModel(db.Model):
    __tablename__ = "question"
    questionId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    questionText = db.Column(db.String(200), nullable=False)
    answers = relationship(AnswerModel, secondary="question_answer")

    def add_answer(self, answer: AnswerModel):
        self.answers.append(answer)


class QuestionAnswerModel(db.Model):
    __tablename__ = "question_answer"
    questionId = db.Column(db.Integer, db.ForeignKey("question.questionId"), primary_key=True)
    answerId = db.Column(db.Integer, db.ForeignKey("answer.answerId"), primary_key=True)


Model = QuestionModel


def get_by_id(question_id):
    result = Model.query.filter(
        Model.questionId == question_id
    ).one_or_none()

    return result


def create(question_text):
    result = Model(questionText=question_text)
    db.session.add(result)
    db.session.flush()

    return result
