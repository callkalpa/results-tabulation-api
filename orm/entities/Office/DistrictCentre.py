from config import db
from orm.entities import Office
from orm.enums import OfficeTypeEnum
from sqlalchemy.orm import relationship, synonym


class DistrictCenterModel(Office.Model):
    __mapper_args__ = {
        'polymorphic_identity': OfficeTypeEnum.DistrictCenter
    }


Model = DistrictCenterModel


def create(officeName, electionId, parentOfficeId=None):
    result = Model(
        officeName=officeName,
        electionId=electionId,
        parentOfficeId=parentOfficeId
    )
    db.session.add(result)
    db.session.commit()

    return result
