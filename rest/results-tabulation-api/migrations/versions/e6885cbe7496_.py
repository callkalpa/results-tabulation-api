"""empty message

Revision ID: e6885cbe7496
Revises: 0c356c23a8eb
Create Date: 2019-09-23 18:04:25.305805

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6885cbe7496'
down_revision = '0c356c23a8eb'
branch_labels = None
depends_on = None


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(None, 'tallySheetVersionRow_CE_201_PV', 'ballotBox', ['ballotBoxStationaryItemId'], ['stationaryItemId'])
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'tallySheetVersionRow_CE_201_PV', type_='foreignkey')
    ### end Alembic commands ###