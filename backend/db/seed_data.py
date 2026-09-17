import uuid
import datetime
from sqlalchemy.orm import Session
from backend.db.database import SessionLocal, Base, engine
from backend.db.models import User, UserRole, Project, ProjectStatus, Site, SiteStatus, Analytics

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding initial users...")
        admin_user = User(
            id=str(uuid.uuid4()),
            google_sub="google-sub-admin-9999",
            email="admin@darukaa.earth",
            name="Alexander Vance (Admin)",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
            role=UserRole.ADMIN.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=365),
            last_login=datetime.datetime.utcnow(),
        )
        analyst_user = User(
            id=str(uuid.uuid4()),
            google_sub="google-sub-analyst-8888",
            email="analyst@darukaa.earth",
            name="Maya Lin (Analyst)",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
            role=UserRole.ANALYST.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=180),
            last_login=datetime.datetime.utcnow(),
        )
        db.add_all([admin_user, analyst_user])
        db.commit()

        print("Seeding demonstration projects...")
        proj1 = Project(
            id=str(uuid.uuid4()),
            name="Amazonian Forest Restoration Project",
            description="Large-scale tropical rainforest canopy restoration and biodiversity corridor protection initiative.",
            project_type="Forestry Restoration",
            status=ProjectStatus.ACTIVE.value,
            country="Brazil",
            region="Pará Basin",
            total_area=4850.75,
            owner_id=admin_user.id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=300),
        )
        proj2 = Project(
            id=str(uuid.uuid4()),
            name="Western Ghats Agroforestry Carbon Project",
            description="Community agroforestry integration combining native shade coffee, teak, and high-sequestration soil carbon techniques.",
            project_type="Agroforestry",
            status=ProjectStatus.ACTIVE.value,
            country="India",
            region="Karnataka Sector",
            total_area=2340.50,
            owner_id=admin_user.id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=200),
        )
        proj3 = Project(
            id=str(uuid.uuid4()),
            name="Sundarbans Blue Carbon & Mangrove Wetland Project",
            description="Mangrove coastline protection, blue carbon sequestration monitoring, and tiger habitat corridor conservation.",
            project_type="Wetland / Blue Carbon",
            status=ProjectStatus.ACTIVE.value,
            country="Bangladesh / India",
            region="Khulna Delta",
            total_area=1780.25,
            owner_id=admin_user.id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=150),
        )

        db.add_all([proj1, proj2, proj3])
        db.commit()

        print("Seeding geographic sites with GeoJSON polygons...")
        # Site 1: Tapajós Core Canopy Site (Brazil)
        site1 = Site(
            id=str(uuid.uuid4()),
            project_id=proj1.id,
            name="Tapajós Core Restoration Sector A",
            description="Dense rainforest sector undergoing high-density enrichment planting of native Brazil nut and Dipteryx trees.",
            geometry={
                "type": "Polygon",
                "coordinates": [[
                    [-54.95, -3.20],
                    [-54.85, -3.20],
                    [-54.85, -3.30],
                    [-54.95, -3.30],
                    [-54.95, -3.20]
                ]]
            },
            area_hectares=2450.50,
            status=SiteStatus.ACTIVE.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=280),
        )

        # Site 2: Xingu Buffer Zone Site (Brazil)
        site2 = Site(
            id=str(uuid.uuid4()),
            project_id=proj1.id,
            name="Xingu Buffer Zone Sector B",
            description="Secondary forest protection zone serving as an ecological bridge between indigenous reserves.",
            geometry={
                "type": "Polygon",
                "coordinates": [[
                    [-53.15, -4.10],
                    [-53.05, -4.10],
                    [-53.05, -4.20],
                    [-53.15, -4.20],
                    [-53.15, -4.10]
                ]]
            },
            area_hectares=2400.25,
            status=SiteStatus.MONITORING.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=260),
        )

        # Site 3: Coorg Shade Plantation Site (India)
        site3 = Site(
            id=str(uuid.uuid4()),
            project_id=proj2.id,
            name="Coorg Bio-Agroforestry Plot 1",
            description="High-altitude shade-grown coffee canopy mixed with native rosewood and cardamom understory.",
            geometry={
                "type": "Polygon",
                "coordinates": [[
                    [75.70, 12.30],
                    [75.78, 12.30],
                    [75.78, 12.22],
                    [75.70, 12.22],
                    [75.70, 12.30]
                ]]
            },
            area_hectares=1340.50,
            status=SiteStatus.ACTIVE.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=190),
        )

        # Site 4: Wayanad Soil Carbon Site (India)
        site4 = Site(
            id=str(uuid.uuid4()),
            project_id=proj2.id,
            name="Wayanad Soil Carbon Basin",
            description="Regenerative agriculture and bamboo buffer strip project targeting soil organic carbon enhancement.",
            geometry={
                "type": "Polygon",
                "coordinates": [[
                    [76.10, 11.60],
                    [76.18, 11.60],
                    [76.18, 11.52],
                    [76.10, 11.52],
                    [76.10, 11.60]
                ]]
            },
            area_hectares=1000.00,
            status=SiteStatus.ACTIVE.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=170),
        )

        # Site 5: Sundarbans Blue Carbon Sector Alpha (Bangladesh)
        site5 = Site(
            id=str(uuid.uuid4()),
            project_id=proj3.id,
            name="Sundarbans Blue Carbon Sector Alpha",
            description="Tidal mangrove forest featuring dense Rhizophora mucronata with high subterranean blue carbon sink rate.",
            geometry={
                "type": "Polygon",
                "coordinates": [[
                    [89.50, 21.80],
                    [89.62, 21.80],
                    [89.62, 21.70],
                    [89.50, 21.70],
                    [89.50, 21.80]
                ]]
            },
            area_hectares=1780.25,
            status=SiteStatus.ACTIVE.value,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=140),
        )

        db.add_all([site1, site2, site3, site4, site5])
        db.commit()

        print("Seeding multi-year historical environmental analytics...")
        sites = [site1, site2, site3, site4, site5]
        now = datetime.datetime.utcnow()

        for s in sites:
            # Generate 4 historical quarterly snapshots
            for idx, months_ago in enumerate([12, 9, 6, 0]):
                recorded_time = now - datetime.timedelta(days=months_ago * 30)
                # Trend upward for carbon stock & biodiversity score
                growth_factor = 1.0 + (idx * 0.06)

                if "Amazonian" in s.name or "Tapajós" in s.name or "Xingu" in s.name:
                    c_stock = round(210.0 * growth_factor, 1)
                    c_seq = round(18.5 * growth_factor, 1)
                    bio = min(98.0, round(78.0 + (idx * 4.2), 1))
                    tc = min(95.0, round(76.0 + (idx * 2.5), 1))
                    biomass = round(190.0 * growth_factor, 1)
                    rain = 2100.0 + (idx * 20)
                    temp = 26.5
                elif "Blue Carbon" in s.name or "Sundarbans" in s.name:
                    c_stock = round(310.0 * growth_factor, 1)
                    c_seq = round(28.0 * growth_factor, 1)
                    bio = min(95.0, round(74.0 + (idx * 3.8), 1))
                    tc = min(90.0, round(72.0 + (idx * 2.0), 1))
                    biomass = round(240.0 * growth_factor, 1)
                    rain = 1850.0
                    temp = 28.0
                else:
                    c_stock = round(145.0 * growth_factor, 1)
                    c_seq = round(12.5 * growth_factor, 1)
                    bio = min(92.0, round(68.0 + (idx * 5.0), 1))
                    tc = min(85.0, round(64.0 + (idx * 3.0), 1))
                    biomass = round(120.0 * growth_factor, 1)
                    rain = 1400.0
                    temp = 23.0

                analytics = Analytics(
                    id=str(uuid.uuid4()),
                    site_id=s.id,
                    recorded_at=recorded_time,
                    carbon_stock=c_stock,
                    carbon_sequestration=c_seq,
                    biodiversity_score=bio,
                    tree_cover_percentage=tc,
                    biomass=biomass,
                    rainfall=rain,
                    temperature=temp,
                )
                db.add(analytics)

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
