from django.contrib import admin
from django.urls import path, include # <-- Ojo con agregar 'include' aquí
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Conectamos las URLs de nuestra API para que entren por /api/
    path('api/', include('usuarios.urls')), 
]

# En desarrollo, Django sirve los archivos multimedia (imágenes subidas)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)