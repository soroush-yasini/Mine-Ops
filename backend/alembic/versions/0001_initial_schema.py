"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # grinding_facilities
    op.create_table('grinding_facilities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=1), nullable=False),
        sa.Column('name_fa', sa.String(), nullable=False),
        sa.Column('name_en', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index(op.f('ix_grinding_facilities_id'), 'grinding_facilities', ['id'], unique=False)

    # drivers
    op.create_table('drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('bank_account', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_drivers_id'), 'drivers', ['id'], unique=False)

    # trucks
    op.create_table('trucks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plate_number', sa.String(), nullable=False),
        sa.Column('default_driver_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['default_driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plate_number')
    )
    op.create_index(op.f('ix_trucks_id'), 'trucks', ['id'], unique=False)

    # truck_trips
    op.create_table('truck_trips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('truck_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('receipt_number', sa.Integer(), nullable=False),
        sa.Column('tonnage_kg', sa.Float(), nullable=False),
        sa.Column('destination_facility_id', sa.Integer(), nullable=True),
        sa.Column('freight_rate_per_ton', sa.BigInteger(), nullable=False),
        sa.Column('total_freight_cost', sa.BigInteger(), nullable=True),
        sa.Column('bol_image', sa.String(), nullable=True),
        sa.Column('is_paid', sa.Boolean(), nullable=True),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('payment_time', sa.Time(), nullable=True),
        sa.Column('payment_receipt_image', sa.String(), nullable=True),
        sa.Column('payment_notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['destination_facility_id'], ['grinding_facilities.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['truck_id'], ['trucks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('receipt_number')
    )
    op.create_index(op.f('ix_truck_trips_id'), 'truck_trips', ['id'], unique=False)

    # bunker_trips
    op.create_table('bunker_trips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('time', sa.Time(), nullable=True),
        sa.Column('truck_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('receipt_number', sa.Integer(), nullable=False),
        sa.Column('tonnage_kg', sa.Float(), nullable=False),
        sa.Column('origin_facility_id', sa.Integer(), nullable=True),
        sa.Column('freight_rate_per_ton', sa.BigInteger(), nullable=False),
        sa.Column('recorded_total_amount', sa.BigInteger(), nullable=True),
        sa.Column('computed_total_amount', sa.BigInteger(), nullable=True),
        sa.Column('tonnage_discrepancy', sa.Float(), nullable=True),
        sa.Column('bol_image', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_paid', sa.Boolean(), nullable=True),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('payment_time', sa.Time(), nullable=True),
        sa.Column('payment_receipt_image', sa.String(), nullable=True),
        sa.Column('payment_notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['origin_facility_id'], ['grinding_facilities.id'], ),
        sa.ForeignKeyConstraint(['truck_id'], ['trucks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('receipt_number')
    )
    op.create_index(op.f('ix_bunker_trips_id'), 'bunker_trips', ['id'], unique=False)

    # lab_reports
    op.create_table('lab_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('facility_id', sa.Integer(), nullable=True),
        sa.Column('report_pdf', sa.String(), nullable=True),
        sa.Column('sample_count', sa.Integer(), nullable=True),
        sa.Column('total_cost', sa.BigInteger(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['facility_id'], ['grinding_facilities.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lab_reports_id'), 'lab_reports', ['id'], unique=False)

    # lab_samples
    op.create_table('lab_samples',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('report_id', sa.Integer(), nullable=True),
        sa.Column('raw_code', sa.String(), nullable=False),
        sa.Column('facility_code', sa.String(length=10), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('month', sa.Integer(), nullable=True),
        sa.Column('day', sa.Integer(), nullable=True),
        sa.Column('sample_type', sa.String(), nullable=True),
        sa.Column('sample_index', sa.Integer(), nullable=True),
        sa.Column('au_ppm', sa.Float(), nullable=False),
        sa.Column('threshold_flag', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['report_id'], ['lab_reports.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lab_samples_id'), 'lab_samples', ['id'], unique=False)

    # financial_ledger
    op.create_table('financial_ledger',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('facility_id', sa.Integer(), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('debit', sa.BigInteger(), nullable=True),
        sa.Column('credit', sa.BigInteger(), nullable=True),
        sa.Column('balance', sa.BigInteger(), nullable=True),
        sa.Column('receipt_number', sa.Integer(), nullable=True),
        sa.Column('ledger_tonnage_kg', sa.Float(), nullable=True),
        sa.Column('rate_per_ton', sa.Integer(), nullable=True),
        sa.Column('bunker_trip_id', sa.Integer(), nullable=True),
        sa.Column('tonnage_discrepancy_kg', sa.Float(), nullable=True),
        sa.Column('discrepancy_flag', sa.Boolean(), nullable=True),
        sa.Column('investigation_notes', sa.Text(), nullable=True),
        sa.Column('investigation_status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['bunker_trip_id'], ['bunker_trips.id'], ),
        sa.ForeignKeyConstraint(['facility_id'], ['grinding_facilities.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_ledger_id'), 'financial_ledger', ['id'], unique=False)

    # Seed data
    op.execute("""
        INSERT INTO grinding_facilities (code, name_fa, name_en, is_active) VALUES
        ('A', 'رباط سفید', 'Robat Sefid', true),
        ('B', 'شن بتن', 'Shen Beton', true),
        ('C', 'کاویان', 'Kavian', true)
    """)

    op.execute("""
        INSERT INTO drivers (full_name, bank_account, phone, is_active) VALUES
        ('حسین طاووسی باغسیاه', 'IR290190000000102529858002', '9155188319', true),
        ('حمید دائمی ابراهیم زاده', 'IR790190000000101103999006', '9109825710', true),
        ('علی رضا طاووسی باغسیاه', 'IR270190000000101447685007', '9153006809', true),
        ('محمد استیری', 'IR560190000000100386782002', '9155085950', true),
        ('مهدی نصرابادی', 'IR070120000000009101189676', '9151183744', true),
        ('حسن اکبری', 'IR6701200100000007551857037', '9151183745', true),
        ('احمد عرفانیان', 'IR070120000000009101189676', '9151810135', true),
        ('غلام حسین جوادی', 'IR460170000000368784874005', '9153070667', true),
        ('حسن رضوی', 'IR350130100000000053900080', '9153070667', true),
        ('مصطفی صاحبی', 'IR910750022110967000055116', '9157089310', true),
        ('محمد احمدآبادی', NULL, NULL, true),
        ('حبیب احمدآبادی', NULL, NULL, true),
        ('هادی احمدآبادی', NULL, NULL, true),
        ('محمدرضا احمدآبادی', NULL, NULL, true),
        ('کریم آبادی', NULL, NULL, true)
    """)

    op.execute("""
        INSERT INTO trucks (plate_number, default_driver_id, is_active) VALUES
        ('14434', (SELECT id FROM drivers WHERE full_name='حمید دائمی ابراهیم زاده'), true),
        ('48297', (SELECT id FROM drivers WHERE full_name='احمد عرفانیان'), true),
        ('74281', (SELECT id FROM drivers WHERE full_name='حسن رضوی'), true),
        ('63643', (SELECT id FROM drivers WHERE full_name='غلام حسین جوادی'), true),
        ('65495', (SELECT id FROM drivers WHERE full_name='مصطفی صاحبی'), true),
        ('14978', NULL, true),
        ('81375', NULL, true),
        ('23911', NULL, true),
        ('97966', NULL, true),
        ('39418', NULL, true),
        ('98176', (SELECT id FROM drivers WHERE full_name='مهدی نصرابادی'), true)
    """)


def downgrade() -> None:
    op.drop_table('financial_ledger')
    op.drop_table('lab_samples')
    op.drop_table('lab_reports')
    op.drop_table('bunker_trips')
    op.drop_table('truck_trips')
    op.drop_table('trucks')
    op.drop_table('drivers')
    op.drop_table('grinding_facilities')
