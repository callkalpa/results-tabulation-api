from orm.entities import Survey
from schemas import SurveySchema


def get_all():
    result = Survey.get_all()
    return SurveySchema(many=True, only=["surveyId", "surveyName"]).dump(result).data


def get_by_id(surveyId):
    result = Survey.get_by_id(survey_id=surveyId)
    return SurveySchema().dump(result).data


