from app import db


class AnswerModel(db.Model):
    __tablename__ = 'answer'
    answerId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    answerText = db.Column(db.String(200), nullable=False)


Model = AnswerModel


def get_by_id(answer_id):
    result = Model.query.filter(
        Model.answerId == answer_id
    ).one_or_none()

    return result


def create(answer_text):
    result = Model(answerText=answer_text)
    db.session.add(result)
    db.session.flush()

    return result
