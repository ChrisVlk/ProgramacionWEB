from django.db import migrations, models


def set_pending_for_non_active(apps, schema_editor):
    Prestamo = apps.get_model('usuarios', 'Prestamo')
    Prestamo.objects.filter(estado='ATRASADO').update(estado='PENDIENTE')


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0005_remove_prestamo_equipo_detalleprestamo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prestamo',
            name='estado',
            field=models.CharField(
                choices=[
                    ('PENDIENTE', 'Pendiente'),
                    ('ACTIVO', 'Activo'),
                    ('DEVUELTO', 'Devuelto'),
                    ('RECHAZADO', 'Rechazado'),
                    ('ATRASADO', 'Atrasado'),
                ],
                default='PENDIENTE',
                max_length=20,
            ),
        ),
        migrations.RunPython(set_pending_for_non_active, migrations.RunPython.noop),
    ]
