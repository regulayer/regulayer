import re

with open('regulayer-control-plane/app/models.py', 'r') as f:
    models_content = f.read()

# Add id: Optional[UUID] = None to all Create models
models_content = re.sub(r'class \w+Create\(BaseModel\):\n', r'\g<0>    id: Optional[UUID] = None\n', models_content)

with open('regulayer-control-plane/app/models.py', 'w') as f:
    f.write(models_content)

with open('regulayer-control-plane/app/compliance_api.py', 'r') as f:
    api_content = f.read()

# For each create_* endpoint, we replace the line: db_item = {Model}DB(id=uuid4(), organization_id=organization_id, **request.dict())
# with upsert logic

def replacer(match):
    model_db = match.group(1)
    
    upsert = f'''if request.id:
        db_item = db.query({model_db}).filter({model_db}.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={{'id'}}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = {model_db}(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={{'id'}}))'''
    
    return upsert


api_content = re.sub(r'db_item = ([A-Za-z0-9_]+DB)\(id=uuid4\(\), organization_id=organization_id, \*\*request\.dict\(\)\)', replacer, api_content)

with open('regulayer-control-plane/app/compliance_api.py', 'w') as f:
    f.write(api_content)

print("Upsert migration complete")
